# Amazon Bedrock Overview

- An API for generative AI Foundation Models
	- Invoke chat text, or image models
	- Pre-built, your own fine-tuned models, or your own models
	- Support for RAG
	- Support for LLM Agents
- Serverless

## Bedrock API Endpoints

- bedrock: Manage, deploy, train models
- bedrock-runtime: Perform inference (execute prompts, generate embeddings)
	- Converse, ConverseStream, InvokeModel, InvokeModelWithResponseStream
- bedrock-agent: Manage, deploy, train LLM agents and knowledge bases
- bedrock-agent-runtime: Perform inference against agents and knowledge agents
	- InvokeAgent, Retrieve, RetrieveAndGenerate

## IAM

- Can't use root user
- AmazonBedrockFullAccess
- AmazonBedrockReadOnly
