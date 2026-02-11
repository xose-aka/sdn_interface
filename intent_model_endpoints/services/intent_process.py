from langchain.utils.math import cosine_similarity
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.prompts import SemanticSimilarityExampleSelector
from langchain_community.vectorstores import Chroma

from exceptions.intent_goal_service_not_available_exception import IntentGoalServiceNotAvailableException
from schemas.ryu_mininet import BlockTraffic, LoadProfiling, DeleteFlow, RateLimiter
from constants.intent_process_config import intent_examples_and_response_structure, weights_template, block_template, \
    delete_template, rate_template


# embedding examples
to_vectorize = [" ".join(example.values()) for example in intent_examples_and_response_structure]
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
vectorstore = Chroma.from_texts(to_vectorize, embeddings, metadatas=intent_examples_and_response_structure)
example_selector = SemanticSimilarityExampleSelector(
    vectorstore=vectorstore,
    k=2,
)
# embedding templates
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
prompt_templates = [weights_template, block_template, delete_template, rate_template]
prompt_embeddings = embeddings.embed_documents(prompt_templates)


def prompt_router(intent, fix):

    query_embedding = embeddings.embed_query(intent)
    similarity = cosine_similarity([query_embedding], prompt_embeddings)[0]
    most_similar = prompt_templates[similarity.argmax()]
    # parser = JsonOutputParser(pydantic_resultect=BlockTraffic)
    if most_similar == block_template:
        parser = JsonOutputParser(pydantic_resultect=BlockTraffic)
    elif most_similar == weights_template:
        parser = JsonOutputParser(pydantic_resultect=LoadProfiling)
    elif most_similar == delete_template:
        parser = JsonOutputParser(pydantic_resultect=DeleteFlow)
    elif most_similar == rate_template:
        parser = JsonOutputParser(pydantic_resultect=RateLimiter)
    else:
        raise IntentGoalServiceNotAvailableException(f"Service isn't available for this goal: {most_similar} in ryu")

    selected_examples = example_selector.select_examples({"question": intent})

    prompt = PromptTemplate.from_template(most_similar,
                                          partial_variables={"format_instructions": parser.get_format_instructions(),
                                                             "examples": str(selected_examples), "fix": fix})

    chain = (
            {"query": RunnablePassthrough()}
            | prompt
            | ChatGoogleGenerativeAI(model="models/gemini-2.5-flash")
            | parser
    )

    return chain
