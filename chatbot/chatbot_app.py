import os
import warnings
import json
import openai

from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain_openai import ChatOpenAI
from PyPDF2 import PdfReader

warnings.filterwarnings("ignore", category=FutureWarning, module='transformers')

# -----------------------------------------------------------------------------
# CONFIGURACIÓN DE OPENAI (ajusta según tu LLM local o remoto)
# -----------------------------------------------------------------------------
openai_api_key = "lm-studio"
openai_base_url = "http://host.docker.internal:1234/v1"

# -----------------------------------------------------------------------------
# RUTAS PARA KNOWLEDGE Y CHROMA
# -----------------------------------------------------------------------------
KNOWLEDGE_BASE_PATH = "/app/knowledge"
CHROMA_DB_DIR = "/app/chroma_db"
COLLECTION_NAME = "futuroterra_collection"

# -----------------------------------------------------------------------------
# INICIALIZAR LLM
# -----------------------------------------------------------------------------
llm = ChatOpenAI(
    temperature=0,
    openai_api_key=openai_api_key,
    openai_api_base=openai_base_url
)

# -----------------------------------------------------------------------------
# INICIALIZAR EMBEDDINGS + CHROMA
# -----------------------------------------------------------------------------
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_store = Chroma(
    embedding_function=embeddings,
    persist_directory=CHROMA_DB_DIR,
    collection_name=COLLECTION_NAME
)

# -----------------------------------------------------------------------------
# FUNCIONES AUXILIARES PARA CARGAR DOCUMENTOS
# -----------------------------------------------------------------------------
def extract_text_from_json(json_obj):
    """Extrae texto recursivamente de un objeto JSON."""
    texts = []
    if isinstance(json_obj, dict):
        for value in json_obj.values():
            texts.append(extract_text_from_json(value))
    elif isinstance(json_obj, list):
        for item in json_obj:
            texts.append(extract_text_from_json(item))
    elif isinstance(json_obj, str):
        texts.append(json_obj)
    return "\n".join(texts)

def load_documents_from_folder(folder_path):
    """Lee archivos .md, .txt, .json, .pdf y retorna (documents, filenames)."""
    documents = []
    filenames = []
    if not os.path.exists(folder_path):
        print(f"Carpeta {folder_path} no existe dentro del contenedor.")
        return documents, filenames

    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if filename.endswith(".md") or filename.endswith(".txt"):
            with open(file_path, 'r', encoding='utf-8') as f:
                documents.append(f.read())
                filenames.append(filename)
        elif filename.endswith(".json"):
            with open(file_path, 'r', encoding='utf-8') as f:
                json_content = json.load(f)
                text = extract_text_from_json(json_content)
                documents.append(text)
                filenames.append(filename)
        elif filename.endswith(".pdf"):
            with open(file_path, 'rb') as f:
                reader = PdfReader(f)
                text = "".join(page.extract_text() for page in reader.pages)
                documents.append(text)
                filenames.append(filename)
    return documents, filenames

def split_texts_with_source(texts, sources):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = []
    chunk_sources = []
    for text, source in zip(texts, sources):
        split_chunks = text_splitter.split_text(text)
        chunks.extend(split_chunks)
        chunk_sources.extend([source] * len(split_chunks))
    return chunks, chunk_sources

# -----------------------------------------------------------------------------
# CARGAR Y ACTUALIZAR EMBEDDINGS
# -----------------------------------------------------------------------------
documents, filenames = load_documents_from_folder(KNOWLEDGE_BASE_PATH)
chunks, chunk_sources = split_texts_with_source(documents, filenames)

existing_metadata = vector_store.get()["metadatas"]
existing_filenames = set(meta.get("source") for meta in existing_metadata if "source" in meta)

new_texts = []
new_metadata = []
for text, source in zip(chunks, chunk_sources):
    if source not in existing_filenames:
        new_texts.append(text)
        new_metadata.append({"source": source})

if new_texts:
    vector_store.add_texts(texts=new_texts, metadatas=new_metadata)
    print(f"✅ Se han cargado {len(new_texts)} nuevos embeddings a ChromaDB.")
else:
    print("ℹ️ No se han encontrado nuevos embeddings para cargar a ChromaDB.")

# -----------------------------------------------------------------------------
# FUNCIONES DE RAG
# -----------------------------------------------------------------------------
chat_history = []

def rag(query, vector_store, chat_history):
    """
    Se construye la pregunta final con un 'system prompt' para que:
    - Sea un asistente de operación minero experto en minas de cobre.
    - Siempre responda en español.
    """
    system_instructions = (
        "Eres un asistente de operación minero experto en la extracción de minas en Mexico y en mejorar el impacto social en las comunidades. "
        "Tu objetivo es brindar información clara y concisa sobre la operacion de una mina de cobre y sobre lo que es futuroterra. "
        "Siempre responde en español.\n"
    )
    final_query = system_instructions + query

    retriever = vector_store.as_retriever()
    qa_chain = ConversationalRetrievalChain.from_llm(llm=llm, retriever=retriever)
    result = qa_chain.invoke({
        "question": final_query,
        "chat_history": chat_history
    })
    return result['answer']

# -----------------------------------------------------------------------------
# SERVIDOR FLASK
# -----------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)  # Habilita CORS para peticiones desde el frontend

@app.route("/")
def index():
    return "FuturoTerra Chatbot Backend OK"

@app.route("/chat", methods=["POST"])
def chat():
    global chat_history
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "No message provided"}), 400

    user_input = data["message"]
    try:
        response = rag(user_input, vector_store, chat_history)
        chat_history.append((user_input, response))
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Si usas un puerto "seguro", p.ej. 6100
    app.run(host="0.0.0.0", port=6100, debug=True)
