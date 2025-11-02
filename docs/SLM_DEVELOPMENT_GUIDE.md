# Small Language Model Development Guide

**Version:** 1.0
**Date:** 2025-10-30
**Purpose:** Practical guide for learning to build, train, and deploy small language models for Context/Chronikle app
**Philosophy:** Learn by doing. Build working models first, understand theory second.

---

## Table of Contents

1. [Why Small Language Models?](#why-small-language-models)
2. [Understanding SLMs](#understanding-slms)
3. [Your Development Environment](#your-development-environment)
4. [The Three Paths](#the-three-paths)
5. [Path A: Fine-Tuning (START HERE)](#path-a-fine-tuning)
6. [Path B: Distillation](#path-b-distillation)
7. [Path C: Training from Scratch](#path-c-training-from-scratch)
8. [Hands-On Tutorials](#hands-on-tutorials)
9. [Production Deployment](#production-deployment)
10. [Cost & Resource Management](#cost-resource-management)
11. [Best Practices](#best-practices)
12. [Resources & Next Steps](#resources-next-steps)

---

## Why Small Language Models?

### The Context/Chronikle Use Case

Your iOS/macOS app needs AI capabilities:
- **Semantic search** across captured notes/content
- **Summarization** of long articles, conversations
- **Embeddings** for similarity matching
- **Classification** (is this important? what's the topic?)
- **Extraction** (pull out key facts, people, dates)

### Why NOT use GPT-4/Claude API?

**Cost:**
- GPT-4: $10-30 per 1M tokens
- SLM on-device: Free after training

**Latency:**
- API call: 200-2000ms
- On-device: 10-100ms

**Privacy:**
- API: User data leaves device
- On-device: Everything stays local

**Availability:**
- API: Requires internet
- On-device: Works offline

### The SLM Sweet Spot

**Models between 100M-3B parameters:**
- Phi-3-mini (3.8B) - Microsoft's tiny model
- Llama 3.2 (1B, 3B) - Meta's small variants
- Qwen2.5 (0.5B, 1.5B, 3B) - Alibaba's efficient models
- Gemma 2 (2B) - Google's compact model

**Can run on:**
- iPhone 15 Pro (8GB RAM)
- MacBook Air M1 (8GB RAM)
- Consumer GPUs (RTX 3090, 4090)

**Performance:**
- Good enough for most tasks
- 10-50x faster than GPT-4
- 1000x cheaper

---

## Understanding SLMs

### What Makes a Model "Small"?

**Parameter Count:**
- **Tiny:** 100M-500M (fast, limited capability)
- **Small:** 500M-1.5B (sweet spot for on-device)
- **Medium:** 1.5B-7B (still manageable on modern hardware)
- **Large:** 7B+ (requires beefier hardware)

**Model Size on Disk:**
- Float32: 4 bytes per parameter
- Float16: 2 bytes per parameter
- Int8: 1 byte per parameter
- Int4: 0.5 bytes per parameter

**Example: 1B parameter model**
- FP32: 4GB
- FP16: 2GB
- Int8: 1GB (quantized)
- Int4: 500MB (heavily quantized)

### Architecture Types

**1. Transformer Decoder-Only (Most Common)**
- Architecture: GPT-style, causal attention
- Use case: Text generation, completion
- Examples: GPT-2, Llama, Phi
- Best for: General-purpose tasks

**2. Encoder-Only (For Understanding)**
- Architecture: BERT-style, bidirectional
- Use case: Classification, embeddings
- Examples: BERT, RoBERTa, sentence-transformers
- Best for: Search, similarity

**3. Encoder-Decoder (For Transformation)**
- Architecture: T5-style, seq2seq
- Use case: Translation, summarization
- Examples: T5, BART, FLAN
- Best for: Specific transformation tasks

**For Context App:**
- **Search/Embeddings:** Use encoder-only (sentence-transformers)
- **Summarization:** Fine-tune decoder-only (Phi-3, Llama)
- **General tasks:** Start with decoder-only

### Key Concepts

**Tokens:**
```
"Hello world" → ["Hello", " world"] (2 tokens)
"Supercalifragilisticexpialidocious" → ["Super", "cal", "ifr", ...] (many tokens)
```
- Average: 1 token ≈ 0.75 words
- Important: Tokenizer affects model efficiency

**Context Window:**
- How much text the model can "see" at once
- Phi-3: 4K-128K tokens
- Llama 3.2: 128K tokens
- Trade-off: Longer = slower, more memory

**Quantization:**
- Reducing precision to save memory
- FP16 → Int8: ~2x smaller, minimal quality loss
- FP16 → Int4: ~4x smaller, noticeable quality loss
- Critical for on-device deployment

---

## Your Development Environment

### Hardware Options

**Option 1: CPU-Only (Learning)**
- What you can do: Load small models, inference, light fine-tuning
- What you can't do: Train from scratch, train large models
- Good for: Getting started, testing code
- Cost: $0 (use your Mac)

**Option 2: Consumer GPU (Serious Learning)**
- **RTX 4090 (24GB VRAM):** Can fine-tune up to 7B models
- **RTX 3090 (24GB VRAM):** Same, slightly slower
- **RTX 4080 (16GB VRAM):** Can fine-tune up to 3B models
- Cost: $1,200-1,600 (one-time)

**Option 3: Cloud GPU (For Big Experiments)**
- **Lambda Labs:** $0.50-1.50/hr for A10/A100
- **RunPod:** $0.30-1.10/hr, more providers
- **Vast.ai:** $0.20-0.80/hr, cheapest, less reliable
- Cost: Pay as you go

**Recommendation:**
1. Start CPU-only on your Mac (learn basics)
2. Graduate to cloud GPU for serious training ($20-50/month)
3. Buy GPU if you train regularly (6+ months in)

### Software Setup

**Install PyTorch:**
```bash
# For Mac (Apple Silicon)
pip install torch torchvision torchaudio

# For CUDA GPU
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

**Essential Libraries:**
```bash
pip install transformers datasets accelerate bitsandbytes peft
pip install wandb  # For experiment tracking (optional but recommended)
pip install sentencepiece  # For tokenizers
```

**Verify Setup:**
```python
import torch
print(f"PyTorch: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB")
```

### Project Structure

```
slm-experiments/
├── data/
│   ├── raw/              # Original datasets
│   ├── processed/        # Cleaned, tokenized
│   └── splits/           # train/val/test
├── models/
│   ├── checkpoints/      # Training checkpoints
│   ├── final/            # Best models
│   └── quantized/        # Compressed for deployment
├── scripts/
│   ├── prepare_data.py
│   ├── train.py
│   ├── evaluate.py
│   └── export.py
├── configs/
│   └── phi3_lora.yaml   # Training configs
├── notebooks/
│   └── exploration.ipynb
└── requirements.txt
```

---

## The Three Paths

### Path A: Fine-Tuning (80% of use cases)

**What:** Take a pretrained model, adapt it to your task
**When:** You have < 10K examples, want results fast
**Cost:** $5-50 per experiment
**Time:** Hours to days
**Difficulty:** ⭐⭐ (Medium)

**Best for Context App:**
- Note summarization
- Text classification
- Custom instruction following

**Start here.** This is your fastest path to working models.

### Path B: Distillation (15% of use cases)

**What:** Train small model to mimic large model
**When:** Need tiny model with big model knowledge
**Cost:** $50-200 per model
**Time:** Days to weeks
**Difficulty:** ⭐⭐⭐ (Hard)

**Best for Context App:**
- When fine-tuning isn't enough
- Need extreme compression (500MB model with GPT-4 knowledge)

**Try after:** You've fine-tuned 3-5 models successfully.

### Path C: Training from Scratch (5% of use cases)

**What:** Build and train model from random initialization
**When:** Unique architecture, massive custom dataset
**Cost:** $500-5,000+ per model
**Time:** Weeks to months
**Difficulty:** ⭐⭐⭐⭐⭐ (Expert)

**Best for Context App:**
- Probably never. Fine-tuning is almost always better.

**Try after:** You have a PhD or 2+ years ML experience.

---

## Path A: Fine-Tuning

### Why Fine-Tuning Works

**The Secret:** Pretrained models already know language. You're just teaching them *your specific task*.

**Example:**
- Pretrained Llama: Knows English, grammar, facts, reasoning
- Your task: Summarize personal notes in 1-2 sentences
- Fine-tuning: Teach model *your summarization style*

**What You Need:**
- Base model (Phi-3, Llama 3.2, Qwen)
- 100-10,000 examples of input → output
- GPU or cloud credits ($20-100)
- 1-3 days of learning/experimenting

### The Fine-Tuning Stack

**1. Choose Base Model**

**For Context App, Recommend:**

| Model | Size | Best For | Why |
|-------|------|----------|-----|
| **Phi-3-mini** | 3.8B | General tasks | Fast, efficient, good quality |
| **Llama 3.2** | 1B-3B | Instruction following | Meta's latest, excellent |
| **Qwen2.5** | 0.5B-3B | Very small models | Best quality/size ratio |
| **Gemma 2** | 2B | Balanced | Google's quality, good licensing |

**Start with Phi-3-mini.** It's the sweet spot.

**2. Efficient Fine-Tuning: LoRA**

**Problem:** Fine-tuning all 3.8B parameters requires:
- 15GB VRAM minimum
- Hours of training
- Expensive

**Solution: LoRA (Low-Rank Adaptation)**
- Only train 0.1% of parameters (adapters)
- Requires 4-8GB VRAM
- 10x faster, 10x cheaper
- Same quality as full fine-tuning

**How it works:**
```python
from peft import LoraConfig, get_peft_model

# Original model: 3.8B parameters
model = AutoModelForCausalLM.from_pretrained("microsoft/Phi-3-mini-4k-instruct")

# Add LoRA adapters: only 3.8M trainable parameters (0.1%)
lora_config = LoraConfig(
    r=16,                    # Rank (higher = more parameters, better quality)
    lora_alpha=32,           # Scaling factor
    target_modules=["q_proj", "v_proj"],  # Which layers to adapt
    lora_dropout=0.05,
    bias="none",
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# Output: trainable params: 3,801,088 (0.1%)
```

**3. Dataset Format**

**For Instruction Fine-Tuning:**
```json
[
  {
    "instruction": "Summarize this note in 1-2 sentences.",
    "input": "Had a great meeting with Sarah about the new product launch. We discussed the timeline, and she mentioned that the design team is ahead of schedule. Marketing will start the campaign in Q2. Budget approved for $50K. Next steps: finalize messaging and coordinate with engineering.",
    "output": "Meeting with Sarah confirmed the product launch timeline with design ahead of schedule. Marketing campaign starts Q2 with $50K budget approved."
  },
  {
    "instruction": "Summarize this note in 1-2 sentences.",
    "input": "Spent 3 hours debugging the API integration issue. Turns out it was a race condition in the async handler. Fixed by adding proper locking. Deployed to staging for testing.",
    "output": "Fixed API integration bug caused by race condition in async handler by adding proper locking. Now deployed to staging."
  }
]
```

**For Chat Fine-Tuning:**
```json
[
  {
    "messages": [
      {"role": "user", "content": "Summarize: [long note text]"},
      {"role": "assistant", "content": "[concise summary]"}
    ]
  }
]
```

**Dataset Size:**
- **Minimum:** 50-100 examples (can work with oversampling)
- **Good:** 500-1,000 examples
- **Ideal:** 5,000-10,000 examples
- **Overkill:** 100,000+ examples (diminishing returns)

### Step-by-Step: Fine-Tune Phi-3 for Summarization

**Step 1: Prepare Your Dataset**

```python
# scripts/prepare_data.py
from datasets import Dataset
import json

# Load your notes (example: from Context app export)
with open("data/raw/my_notes.json") as f:
    notes = json.load(f)

# Format for fine-tuning
examples = []
for note in notes:
    # Skip if no summary (you'll need to create these)
    if "summary" not in note:
        continue

    examples.append({
        "instruction": "Summarize this note in 1-2 sentences.",
        "input": note["content"],
        "output": note["summary"]
    })

# Create Hugging Face dataset
dataset = Dataset.from_list(examples)

# Split into train/val
dataset = dataset.train_test_split(test_size=0.1, seed=42)

# Save
dataset.save_to_disk("data/processed/summarization_dataset")

print(f"Training examples: {len(dataset['train'])}")
print(f"Validation examples: {len(dataset['test'])}")
```

**Pro tip:** Don't have summaries? Use Claude/GPT-4 to generate them:
```python
import anthropic

client = anthropic.Anthropic()

for note in notes:
    response = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=100,
        messages=[{
            "role": "user",
            "content": f"Summarize this note in 1-2 sentences:\n\n{note['content']}"
        }]
    )
    note["summary"] = response.content[0].text
```

**Step 2: Write Training Script**

```python
# scripts/train.py
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_from_disk

# Load model and tokenizer
model_name = "microsoft/Phi-3-mini-4k-instruct"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True,
)
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

# Configure LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = prepare_model_for_kbit_training(model)
model = get_peft_model(model, lora_config)

# Load dataset
dataset = load_from_disk("data/processed/summarization_dataset")

# Tokenize
def format_instruction(example):
    prompt = f"""### Instruction:
{example['instruction']}

### Input:
{example['input']}

### Response:
{example['output']}"""
    return {"text": prompt}

dataset = dataset.map(format_instruction)

def tokenize(examples):
    return tokenizer(
        examples["text"],
        truncation=True,
        max_length=2048,
        padding="max_length",
    )

tokenized_dataset = dataset.map(tokenize, batched=True, remove_columns=dataset["train"].column_names)

# Training arguments
training_args = TrainingArguments(
    output_dir="./models/checkpoints/phi3-summarization",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    gradient_accumulation_steps=4,  # Effective batch size: 16
    learning_rate=2e-4,
    warmup_steps=100,
    logging_steps=10,
    save_steps=100,
    eval_steps=100,
    evaluation_strategy="steps",
    save_total_limit=3,
    load_best_model_at_end=True,
    report_to="none",  # or "wandb" if you set it up
    fp16=True,  # Mixed precision training
)

# Train
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["test"],
)

trainer.train()

# Save final model
model.save_pretrained("./models/final/phi3-summarization-lora")
tokenizer.save_pretrained("./models/final/phi3-summarization-lora")

print("Training complete!")
```

**Step 3: Run Training**

```bash
# On local GPU
python scripts/train.py

# On cloud (example: Lambda Labs)
# 1. Upload code to cloud instance
# 2. SSH in
# 3. Run training
ssh username@instance-ip
cd slm-experiments
python scripts/train.py
```

**What to expect:**
- Training time: 1-4 hours (depends on dataset size, GPU)
- Memory usage: 8-12GB VRAM
- Cost: $0 (local) or $0.50-2.00 (cloud)

**Step 4: Evaluate**

```python
# scripts/evaluate.py
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "microsoft/Phi-3-mini-4k-instruct",
    torch_dtype=torch.float16,
    device_map="auto",
)

# Load LoRA adapters
model = PeftModel.from_pretrained(base_model, "./models/final/phi3-summarization-lora")
tokenizer = AutoTokenizer.from_pretrained("./models/final/phi3-summarization-lora")

# Test on new note
test_note = """
Had a productive day working on the Context app. Implemented the new search algorithm using vector embeddings. Performance is much better than the old keyword search. Need to add caching layer next week. Also, met with the design team about the UI refresh. They showed some mockups that look great. Launch target is still Q1.
"""

prompt = f"""### Instruction:
Summarize this note in 1-2 sentences.

### Input:
{test_note}

### Response:
"""

inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
summary = tokenizer.decode(outputs[0], skip_special_tokens=True)

print("Original:", test_note)
print("\nSummary:", summary.split("### Response:")[-1].strip())
```

**Good summary example:**
> "Implemented new vector embedding search in Context app with better performance than keyword search. Met with design team about UI refresh mockups for Q1 launch."

**Step 5: Export for Deployment**

```python
# scripts/export.py
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# Merge LoRA weights into base model
base_model = AutoModelForCausalLM.from_pretrained("microsoft/Phi-3-mini-4k-instruct")
model = PeftModel.from_pretrained(base_model, "./models/final/phi3-summarization-lora")

# Merge and unload
merged_model = model.merge_and_unload()

# Save as regular model
merged_model.save_pretrained("./models/final/phi3-summarization-merged")
tokenizer = AutoTokenizer.from_pretrained("./models/final/phi3-summarization-lora")
tokenizer.save_pretrained("./models/final/phi3-summarization-merged")

# Quantize to int8 for on-device
from optimum.onnxruntime import ORTModelForCausalLM

ort_model = ORTModelForCausalLM.from_pretrained(
    "./models/final/phi3-summarization-merged",
    export=True,
)
ort_model.save_pretrained("./models/quantized/phi3-summarization-int8")

print("Model exported and quantized!")
print(f"Original size: {model_size_mb('merged')} MB")
print(f"Quantized size: {model_size_mb('quantized')} MB")
```

### Common Issues & Solutions

**Problem: Out of Memory (OOM)**

Solutions:
```python
# 1. Reduce batch size
per_device_train_batch_size=2  # Instead of 4

# 2. Use gradient checkpointing
model.gradient_checkpointing_enable()

# 3. Use 8-bit quantization
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_8bit=True,
    device_map="auto",
)

# 4. Reduce sequence length
max_length=1024  # Instead of 2048
```

**Problem: Model outputs gibberish**

Causes & fixes:
- Learning rate too high → Try 1e-5 instead of 2e-4
- Not enough training → Increase epochs from 3 to 5-10
- Dataset too small → Need more examples (or synthetic data)
- Wrong prompt format → Check model's expected format

**Problem: Training loss not decreasing**

Debugging:
```python
# Check if data is loading correctly
print(tokenized_dataset["train"][0])

# Check if model is trainable
print(model.print_trainable_parameters())

# Monitor gradient norms
from torch.utils.tensorboard import SummaryWriter
# Add gradient logging to trainer
```

**Problem: Model overfits (train loss low, val loss high)**

Solutions:
- Increase dropout: `lora_dropout=0.1`
- Add more data augmentation
- Reduce training epochs
- Increase regularization

---

## Path B: Distillation

### Why Distillation?

**Scenario:** You need a tiny model (500MB) that's smart like GPT-4.

**Fine-tuning won't work because:**
- Small models have limited capacity
- Can't learn complex reasoning from examples alone
- Need to transfer knowledge, not just patterns

**Distillation works because:**
- Teacher model (GPT-4) generates high-quality training data
- Student model learns from teacher's probability distributions
- Can compress 100B parameters → 1B with 80% performance

### When to Use Distillation

**Good use cases:**
- Need extreme compression (GPT-4 knowledge in 500MB)
- Have budget for API calls ($50-500 for data generation)
- Task requires reasoning beyond what fine-tuning achieves

**Bad use cases:**
- Simple tasks (fine-tuning is easier and cheaper)
- Don't have API budget
- Can afford larger model (just use fine-tuning)

### Distillation Approaches

**Approach 1: Synthetic Data Generation**

Generate training data with teacher model:
```python
import anthropic

client = anthropic.Anthropic()

# Define your task
tasks = [
    "Summarize this article",
    "Extract key facts",
    "Answer this question",
    "Classify sentiment",
]

synthetic_data = []

for i in range(10000):  # Generate 10K examples
    # Random task
    task = random.choice(tasks)

    # Generate input (use your real data)
    input_text = get_random_note_from_context_app()

    # Get teacher's output
    response = client.messages.create(
        model="claude-3-opus-20240229",  # Best teacher
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"{task}: {input_text}"
        }]
    )

    synthetic_data.append({
        "input": f"{task}: {input_text}",
        "output": response.content[0].text
    })

# Now fine-tune student on this synthetic data
```

**Cost:** $50-500 depending on size (Claude Opus: $15/1M tokens)

**Approach 2: Knowledge Distillation Loss**

Train student to match teacher's probability distribution:

```python
import torch
import torch.nn.functional as F

def distillation_loss(student_logits, teacher_logits, labels, alpha=0.5, temperature=2.0):
    """
    Combine two losses:
    1. Student's prediction vs true labels (hard targets)
    2. Student's distribution vs teacher's distribution (soft targets)
    """
    # Hard loss (normal cross-entropy)
    hard_loss = F.cross_entropy(student_logits, labels)

    # Soft loss (KL divergence between distributions)
    student_soft = F.log_softmax(student_logits / temperature, dim=-1)
    teacher_soft = F.softmax(teacher_logits / temperature, dim=-1)
    soft_loss = F.kl_div(student_soft, teacher_soft, reduction='batchmean') * (temperature ** 2)

    # Combine
    loss = alpha * hard_loss + (1 - alpha) * soft_loss
    return loss

# Training loop
for batch in dataloader:
    inputs, labels = batch

    # Get teacher predictions (no grad)
    with torch.no_grad():
        teacher_logits = teacher_model(inputs).logits

    # Get student predictions
    student_logits = student_model(inputs).logits

    # Compute distillation loss
    loss = distillation_loss(student_logits, teacher_logits, labels)

    loss.backward()
    optimizer.step()
```

**When to use:** You have a good mid-size teacher model and want to compress it further.

### Practical Distillation Recipe

**Goal:** Distill Claude/GPT-4 knowledge into Phi-3-mini for Context app.

**Step 1: Generate Diverse Prompts**

```python
# Create diverse task prompts for your use cases
prompts = [
    # Summarization variants
    "Summarize this note in one sentence",
    "Provide a 2-3 sentence summary",
    "What are the key takeaways?",
    "TL;DR:",

    # Q&A variants
    "What is the main topic?",
    "Who are the people mentioned?",
    "What are the action items?",
    "When is the deadline?",

    # Classification
    "Is this note work-related or personal?",
    "What category does this belong to?",
    "Rate the importance (1-5)",

    # Extraction
    "List all dates mentioned",
    "Extract names and contact info",
    "Find any URLs or links",
]
```

**Step 2: Generate Synthetic Dataset**

```python
# scripts/generate_synthetic_data.py
import anthropic
from tqdm import tqdm
import json

client = anthropic.Anthropic()

# Load your existing notes
with open("context_app_notes.json") as f:
    notes = json.load(f)

synthetic_dataset = []

for note in tqdm(notes):
    for prompt_template in prompts:
        full_prompt = f"{prompt_template}\n\n{note['content']}"

        try:
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",  # Good balance of cost/quality
                max_tokens=500,
                messages=[{"role": "user", "content": full_prompt}]
            )

            synthetic_dataset.append({
                "instruction": prompt_template,
                "input": note['content'],
                "output": response.content[0].text
            })

        except Exception as e:
            print(f"Error: {e}")
            continue

# Save
with open("synthetic_training_data.json", "w") as f:
    json.dump(synthetic_dataset, f, indent=2)

print(f"Generated {len(synthetic_dataset)} training examples")
print(f"Estimated cost: ${len(synthetic_dataset) * 0.003:.2f}")  # Rough estimate
```

**Cost estimate:**
- 1,000 notes × 10 prompts = 10,000 examples
- Avg 500 tokens per completion
- Total: 5M tokens
- Cost: $15 (Claude Sonnet)

**Step 3: Fine-tune Student**

Use the exact same fine-tuning process from Path A, but with synthetic data.

**Step 4: Evaluate Quality**

```python
# Compare student vs teacher on held-out test set
test_notes = notes[-100:]  # Last 100 notes

student_outputs = []
teacher_outputs = []

for note in test_notes:
    prompt = "Summarize: " + note['content']

    # Student inference
    student_out = generate_with_student(prompt)
    student_outputs.append(student_out)

    # Teacher inference
    teacher_out = generate_with_teacher(prompt)
    teacher_outputs.append(teacher_out)

# Compute similarity (cosine similarity of embeddings)
from sentence_transformers import SentenceTransformer, util

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
student_embs = embedding_model.encode(student_outputs)
teacher_embs = embedding_model.encode(teacher_outputs)

similarity = util.cos_sim(student_embs, teacher_embs).diagonal().mean()
print(f"Average similarity: {similarity:.2%}")
# Target: >85% means good distillation
```

### Advanced: Multi-Teacher Distillation

Use multiple teachers for better results:

```python
# Generate with multiple teachers
teachers = {
    "claude": anthropic.Anthropic(),
    "gpt4": openai.OpenAI(),
    "gemini": genai.GenerativeModel(),
}

for note in notes:
    # Get outputs from all teachers
    outputs = {}
    for name, client in teachers.items():
        outputs[name] = generate_response(client, note)

    # Use consensus or best output
    best_output = select_best(outputs)  # Based on length, quality, etc.

    synthetic_dataset.append({
        "input": note['content'],
        "output": best_output,
    })
```

---

## Path C: Training from Scratch

### Should You Train from Scratch?

**Reality check:** Almost never worth it for your use case.

**When it MIGHT make sense:**
- You have a unique tokenizer requirement (e.g., code + natural language)
- You have 100GB+ of domain-specific data
- You need a completely custom architecture
- You have $5,000+ and 3+ months

**For Context app:** Just fine-tune. Seriously.

### If You Insist...

**Prerequisites:**
- Strong understanding of transformer architecture
- Experience with distributed training
- Access to multi-GPU setup or serious cloud budget
- Large, high-quality dataset (10GB+ text minimum)

**Estimated costs:**
- **Tiny model (100M params):** $500-1,000, 1-2 weeks
- **Small model (500M params):** $2,000-5,000, 2-4 weeks
- **Medium model (1B params):** $5,000-10,000, 4-8 weeks

**High-level steps:**

1. **Build tokenizer**
```python
from tokenizers import Tokenizer, models, trainers

# Train BPE tokenizer on your data
tokenizer = Tokenizer(models.BPE())
trainer = trainers.BpeTrainer(vocab_size=32000, special_tokens=["<pad>", "<s>", "</s>"])
tokenizer.train(files=["data.txt"], trainer=trainer)
```

2. **Define architecture**
```python
from transformers import GPT2Config, GPT2LMHeadModel

config = GPT2Config(
    vocab_size=32000,
    n_positions=2048,
    n_embd=768,  # Embedding dimension
    n_layer=12,  # Number of transformer layers
    n_head=12,   # Number of attention heads
)

model = GPT2LMHeadModel(config)
print(f"Model size: {model.num_parameters() / 1e6:.1f}M parameters")
```

3. **Pretrain on large corpus**
```python
# This takes days/weeks on multiple GPUs
# Use frameworks like Megatron-LM or DeepSpeed for efficiency
```

4. **Fine-tune on downstream tasks**

**Recommendation:** Skip this path. Use fine-tuning instead.

---

## Hands-On Tutorials

### Tutorial 1: Fine-tune for Note Summarization

**Goal:** Summarize Context app notes in 1-2 sentences.

**Time:** 2-4 hours
**Cost:** $5-20
**Difficulty:** ⭐⭐

**What you'll learn:**
- Data preparation
- LoRA fine-tuning
- Model evaluation
- Export for deployment

**Prerequisites:**
- 100+ notes from Context app (or use synthetic data)
- GPU or cloud credits
- Python environment set up

**Steps:**

1. **Export notes from Context app**
   - Export as JSON: `[{"id": 1, "content": "...", "date": "..."}, ...]`

2. **Generate summaries using Claude** (if you don't have them)
   ```python
   # See "Practical Distillation Recipe" section above
   ```

3. **Prepare dataset**
   ```python
   # See "Step 1: Prepare Your Dataset" in Path A
   ```

4. **Train model**
   ```python
   # See "Step 2: Write Training Script" in Path A
   ```

5. **Evaluate results**
   ```python
   # See "Step 4: Evaluate" in Path A
   ```

6. **Iterate:**
   - Too verbose? Add "concise" to instruction
   - Wrong style? Add more examples of your preferred style
   - Missing details? Increase output length

**Success criteria:**
- Training loss < 0.5
- Validation loss < 1.0
- Subjectively good summaries on test set

### Tutorial 2: Build Semantic Search Embeddings

**Goal:** Create embedding model for Context app search.

**Time:** 1-2 hours
**Cost:** $0-10
**Difficulty:** ⭐

**What you'll learn:**
- Using sentence-transformers
- Fine-tuning embeddings
- Evaluation with retrieval metrics

**Steps:**

1. **Install sentence-transformers**
   ```bash
   pip install sentence-transformers
   ```

2. **Start with pretrained model**
   ```python
   from sentence_transformers import SentenceTransformer

   model = SentenceTransformer('all-MiniLM-L6-v2')

   # Encode your notes
   notes = ["Note 1 text...", "Note 2 text...", ...]
   embeddings = model.encode(notes)

   # Search
   query = "machine learning projects"
   query_embedding = model.encode(query)

   from sentence_transformers import util
   similarities = util.cos_sim(query_embedding, embeddings)[0]
   top_results = similarities.argsort(descending=True)[:5]
   ```

3. **Fine-tune on your data** (optional, for better results)
   ```python
   from sentence_transformers import InputExample, losses

   # Create training examples (note, similar note)
   train_examples = [
       InputExample(texts=['Note about ML', 'Another ML note'], label=1.0),
       InputExample(texts=['Note about ML', 'Note about cooking'], label=0.0),
   ]

   # Fine-tune
   train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=16)
   train_loss = losses.CosineSimilarityLoss(model)
   model.fit(train_objectives=[(train_dataloader, train_loss)], epochs=3)
   ```

4. **Export to Core ML** (for iOS)
   ```python
   import coremltools as ct

   # Convert to Core ML format
   mlmodel = ct.convert(
       model,
       inputs=[ct.TensorType(shape=(1, 384))],  # Embedding size
   )
   mlmodel.save("NoteEmbeddings.mlpackage")
   ```

**Success criteria:**
- Relevant notes rank in top 5 for test queries
- Latency < 50ms per query on iPhone

### Tutorial 3: Question Answering on Your Notes

**Goal:** Ask questions about your Context app notes, get answers.

**Time:** 3-5 hours
**Cost:** $10-50
**Difficulty:** ⭐⭐⭐

**What you'll learn:**
- Retrieval-augmented generation (RAG)
- Combining search + generation
- End-to-end Q&A system

**Architecture:**
```
User Question
     ↓
1. Embed question
     ↓
2. Search notes (semantic similarity)
     ↓
3. Retrieve top 5 relevant notes
     ↓
4. Feed notes + question to LLM
     ↓
5. Generate answer
```

**Implementation:**

```python
class ContextQA:
    def __init__(self, notes_db, embedding_model, generation_model):
        self.notes_db = notes_db
        self.embedding_model = embedding_model
        self.generation_model = generation_model

        # Precompute note embeddings
        self.note_embeddings = self.embedding_model.encode(
            [note['content'] for note in notes_db]
        )

    def answer_question(self, question):
        # 1. Embed question
        question_embedding = self.embedding_model.encode(question)

        # 2. Search for relevant notes
        similarities = util.cos_sim(question_embedding, self.note_embeddings)[0]
        top_indices = similarities.argsort(descending=True)[:5]
        relevant_notes = [self.notes_db[i]['content'] for i in top_indices]

        # 3. Create prompt with context
        context = "\n\n".join([f"Note {i+1}: {note}" for i, note in enumerate(relevant_notes)])
        prompt = f"""Based on these notes:

{context}

Answer this question: {question}

Answer:"""

        # 4. Generate answer
        inputs = self.tokenizer(prompt, return_tensors="pt").to("cuda")
        outputs = self.generation_model.generate(**inputs, max_new_tokens=200)
        answer = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        return {
            "answer": answer.split("Answer:")[-1].strip(),
            "sources": [self.notes_db[i]['id'] for i in top_indices],
        }

# Usage
qa_system = ContextQA(
    notes_db=load_notes(),
    embedding_model=SentenceTransformer('all-MiniLM-L6-v2'),
    generation_model=load_phi3_model(),
)

result = qa_system.answer_question("What did I discuss with Sarah about the product launch?")
print(result["answer"])
print(f"Sources: {result['sources']}")
```

**Optimization for on-device:**
- Cache note embeddings (don't recompute every time)
- Quantize generation model to int8
- Limit context to 3 notes instead of 5

---

## Production Deployment

### From Model to iOS/macOS App

**Your journey:**
PyTorch model → Quantized → Core ML → Xcode → App

### Step 1: Quantization

**Why:** Reduce model size for on-device deployment.

**Options:**

**INT8 Quantization (2x compression, minimal quality loss):**
```python
from transformers import AutoModelForCausalLM
import torch

# Load your fine-tuned model
model = AutoModelForCausalLM.from_pretrained("./models/final/phi3-summarization-merged")

# Quantize to int8
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},
    dtype=torch.qint8
)

# Save
torch.save(quantized_model.state_dict(), "./models/quantized/phi3-int8.pt")

# Size comparison
original_size = sum(p.numel() * p.element_size() for p in model.parameters()) / 1e6
quantized_size = sum(p.numel() * p.element_size() for p in quantized_model.parameters()) / 1e6
print(f"Original: {original_size:.1f} MB")
print(f"Quantized: {quantized_size:.1f} MB")
print(f"Compression: {original_size / quantized_size:.1f}x")
```

**INT4 Quantization (4x compression, some quality loss):**
```python
from optimum.gptq import GPTQQuantizer

quantizer = GPTQQuantizer(bits=4, dataset="c4", block_name_to_quantize="model.layers")
quantized_model = quantizer.quantize_model(model, tokenizer)
```

**Quality comparison:**
- **FP16:** Best quality, largest size
- **INT8:** 98% of FP16 quality, 2x smaller
- **INT4:** 90-95% of FP16 quality, 4x smaller

### Step 2: Convert to Core ML

```python
import coremltools as ct
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load quantized model
model = AutoModelForCausalLM.from_pretrained("./models/quantized/phi3-int8")
tokenizer = AutoTokenizer.from_pretrained("./models/quantized/phi3-int8")

# Trace model with example input
example_input = tokenizer("Summarize:", return_tensors="pt")
traced_model = torch.jit.trace(model, example_input["input_ids"])

# Convert to Core ML
mlmodel = ct.convert(
    traced_model,
    inputs=[ct.TensorType(name="input_ids", shape=(1, ct.RangeDim(1, 512)))],
    minimum_deployment_target=ct.target.iOS17,
)

# Add metadata
mlmodel.author = "Context App Team"
mlmodel.short_description = "Note summarization model"
mlmodel.version = "1.0.0"

# Save
mlmodel.save("NoteSummarizer.mlpackage")
```

### Step 3: Integrate in Xcode

**Swift code example:**

```swift
import CoreML

class NoteSummarizer {
    let model: NoteSummarizerModel

    init() {
        self.model = try! NoteSummarizerModel(configuration: MLModelConfiguration())
    }

    func summarize(note: String) -> String {
        // Tokenize input
        let tokens = tokenize(note)

        // Run model
        let input = NoteSummarizerModelInput(input_ids: tokens)
        let output = try! model.prediction(input: input)

        // Decode output
        let summary = decode(output.output_ids)
        return summary
    }
}

// Usage
let summarizer = NoteSummarizer()
let summary = summarizer.summarize(note: userNote)
print(summary)
```

### Step 4: Performance Optimization

**Measure latency:**
```swift
let start = Date()
let summary = summarizer.summarize(note: note)
let latency = Date().timeIntervalSince(start)
print("Latency: \(latency * 1000)ms")
```

**Target performance:**
- **iPhone 15 Pro:** < 100ms for summarization
- **iPhone 14:** < 300ms
- **iPhone 13 and older:** May need cloud fallback

**Optimization techniques:**

1. **Reduce sequence length:**
   ```swift
   // Truncate long notes
   let maxTokens = 256
   let truncated = note.prefix(maxTokens * 4)  // Rough estimate
   ```

2. **Batch processing:**
   ```swift
   // Summarize multiple notes at once
   let summaries = summarizer.batchSummarize(notes: notes)
   ```

3. **Cache results:**
   ```swift
   // Don't re-summarize unchanged notes
   if let cached = cache[note.id] {
       return cached
   }
   ```

### Step 5: Model Versioning Strategy

**Semantic versioning for models:**
- `v1.0.0` - Initial release
- `v1.1.0` - Improved on more data (minor update)
- `v2.0.0` - New architecture or major change

**Deployment strategy:**

```swift
enum ModelVersion: String {
    case v1_0_0 = "1.0.0"
    case v1_1_0 = "1.1.0"
    case v2_0_0 = "2.0.0"
}

class ModelManager {
    var currentVersion: ModelVersion = .v1_1_0

    func updateModel(to version: ModelVersion) {
        // Download new model from server
        downloadModel(version: version)

        // Load new model
        let newModel = loadModel(version: version)

        // A/B test: Use new model for 10% of requests
        if shouldUseNewModel(rolloutPercentage: 0.1) {
            self.model = newModel
        }
    }
}
```

### Step 6: Fallback to Cloud

**Hybrid approach:** On-device when possible, cloud when needed.

```swift
func summarize(note: String) async -> String {
    // Try on-device first
    if let summary = try? summarizeOnDevice(note: note) {
        return summary
    }

    // Fallback to Claude API
    return await summarizeWithClaude(note: note)
}

func summarizeOnDevice(note: String) throws -> String {
    // Check if model is available
    guard let model = self.model else {
        throw SummarizationError.modelNotAvailable
    }

    // Check if note is too long
    guard note.count < 4000 else {
        throw SummarizationError.noteTooLong
    }

    // Run inference
    let start = Date()
    let summary = model.predict(note: note)
    let latency = Date().timeIntervalSince(start)

    // Timeout check
    guard latency < 1.0 else {
        throw SummarizationError.timeout
    }

    return summary
}
```

---

## Cost & Resource Management

### Computing Cost Breakdown

**Local GPU (One-time investment):**
- **RTX 4090 (24GB):** $1,600
- **RTX 4080 (16GB):** $1,200
- **RTX 3090 (24GB):** $1,000 (used)

**Break-even analysis:**
- Fine-tuning cost on cloud: $5-20 per experiment
- If you run 100 experiments: $500-2,000
- **Break-even: 3-12 months of regular use**

**Cloud GPU (Pay-as-you-go):**

| Provider | GPU | VRAM | Cost/hour | Use case |
|----------|-----|------|-----------|----------|
| Lambda Labs | A10 | 24GB | $0.60 | Fine-tuning up to 7B |
| Lambda Labs | A100 | 80GB | $1.29 | Fine-tuning 13B+ |
| RunPod | RTX 4090 | 24GB | $0.44 | Cheapest 24GB option |
| Vast.ai | RTX 3090 | 24GB | $0.20-0.40 | Cheapest, less reliable |

**Typical costs per experiment:**
- **Small fine-tune (1B model, 500 examples):** $1-5
- **Large fine-tune (7B model, 5K examples):** $10-50
- **Distillation (synthetic data generation):** $50-200
- **Training from scratch:** $500-5,000+

### Budget Strategies

**$0/month (Learning):**
- Use CPU-only on Mac
- Use free Colab (15GB RAM, limited GPU hours)
- Use free tier of HuggingFace Spaces
- Focus on small models (<1B)

**$20/month (Hobbyist):**
- RunPod/Vast.ai for occasional fine-tuning
- 10-20 experiments per month
- Can fine-tune 3B models

**$100/month (Serious):**
- Lambda Labs for reliable training
- 50+ experiments per month
- Can fine-tune 7B models

**$500+/month (Professional):**
- Multiple A100s for large models
- Training from scratch
- Production deployment

### Optimization Techniques

**1. Gradient Accumulation (Simulate larger batch size):**
```python
# Instead of batch_size=32 (requires 32GB VRAM)
# Use batch_size=4 + gradient_accumulation_steps=8
# Effective batch size: 32, but only 4 in memory at once

training_args = TrainingArguments(
    per_device_train_batch_size=4,
    gradient_accumulation_steps=8,
)
```

**2. Mixed Precision Training (FP16):**
```python
# 2x faster, 2x less memory
training_args = TrainingArguments(
    fp16=True,  # On CUDA
    bf16=True,  # On newer GPUs / Apple Silicon
)
```

**3. Gradient Checkpointing:**
```python
# Trade compute for memory (slower but uses less RAM)
model.gradient_checkpointing_enable()
```

**4. LoRA + 8-bit Quantization:**
```python
# Finest-tuning 7B model in 8GB RAM
from peft import prepare_model_for_kbit_training

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    load_in_8bit=True,
    device_map="auto",
)
model = prepare_model_for_kbit_training(model)
model = get_peft_model(model, lora_config)
```

**5. Efficient Data Loading:**
```python
# Don't load entire dataset in memory
from datasets import load_dataset

dataset = load_dataset(
    "json",
    data_files="large_dataset.json",
    streaming=True,  # Stream from disk
)
```

### Monitoring Costs

**Track spending:**
```python
import time

class TrainingCostTracker:
    def __init__(self, gpu_type="A10", hourly_rate=0.60):
        self.hourly_rate = hourly_rate
        self.start_time = None

    def start(self):
        self.start_time = time.time()

    def get_cost(self):
        hours = (time.time() - self.start_time) / 3600
        return hours * self.hourly_rate

    def report(self):
        cost = self.get_cost()
        hours = (time.time() - self.start_time) / 3600
        print(f"Training time: {hours:.2f} hours")
        print(f"Estimated cost: ${cost:.2f}")

# Usage
tracker = TrainingCostTracker(gpu_type="A10", hourly_rate=0.60)
tracker.start()

# ... training ...

tracker.report()
# Output: Training time: 2.5 hours, Estimated cost: $1.50
```

---

## Best Practices

### Dataset Quality > Quantity

**Bad dataset (10,000 examples):**
- Noisy, inconsistent format
- Duplicate examples
- Poor quality outputs
- **Result:** Model learns garbage

**Good dataset (500 examples):**
- Clean, consistent format
- Diverse, representative examples
- High-quality outputs
- **Result:** Model learns well

**Tips:**
1. **Clean your data:**
   - Remove duplicates
   - Fix encoding issues
   - Standardize formatting

2. **Balance your dataset:**
   - Equal distribution of example types
   - Mix of easy and hard examples
   - Representative of real use cases

3. **Validate quality:**
   - Manually review 100 random examples
   - Check for errors, inconsistencies
   - Fix or remove bad examples

### Hyperparameter Starting Points

**For LoRA fine-tuning:**
```python
lora_config = LoraConfig(
    r=16,                    # Start here, increase if underfitting
    lora_alpha=32,           # Usually 2x the rank
    lora_dropout=0.05,       # 0.05-0.1 for regularization
    target_modules=["q_proj", "v_proj"],  # Or all linear layers
)

training_args = TrainingArguments(
    learning_rate=2e-4,      # LoRA can handle higher LR
    num_train_epochs=3,      # Start with 3, adjust based on loss
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    warmup_steps=100,        # Gradually increase LR
    weight_decay=0.01,       # L2 regularization
    logging_steps=10,
    save_steps=100,
    eval_steps=100,
)
```

**Learning rate schedule:**
- Too high (>1e-3): Loss explodes or doesn't decrease
- Good (1e-4 - 5e-4): Steady decrease
- Too low (<1e-5): Very slow learning

### Evaluation Strategy

**Don't just look at loss. Measure what matters:**

**1. Perplexity (General quality):**
```python
import torch

def calculate_perplexity(model, eval_dataset):
    model.eval()
    total_loss = 0

    with torch.no_grad():
        for batch in eval_dataset:
            outputs = model(**batch)
            total_loss += outputs.loss.item()

    avg_loss = total_loss / len(eval_dataset)
    perplexity = torch.exp(torch.tensor(avg_loss))
    return perplexity.item()

# Lower is better. Good: <10, Great: <5
```

**2. Task-specific metrics:**

For summarization:
- **ROUGE score** (overlap with reference)
- **Human evaluation** (is it good?)
- **Length check** (too long/short?)

```python
from rouge import Rouge

rouge = Rouge()
scores = rouge.get_scores(generated_summaries, reference_summaries)
print(f"ROUGE-L: {scores[0]['rouge-l']['f']:.3f}")  # Target: >0.4
```

For classification:
- **Accuracy**
- **F1 score**
- **Confusion matrix**

**3. Latency (Speed):**
```python
import time

def measure_latency(model, prompt, num_runs=10):
    latencies = []
    for _ in range(num_runs):
        start = time.time()
        model.generate(prompt, max_new_tokens=100)
        latencies.append(time.time() - start)

    return {
        "mean": np.mean(latencies),
        "p50": np.percentile(latencies, 50),
        "p95": np.percentile(latencies, 95),
    }

# Target for on-device: p95 < 200ms
```

**4. Regression testing:**
```python
# Save test examples
test_cases = [
    {"input": "...", "expected_output": "...", "actual_output": "..."},
]

# After each training run, check if quality degraded
def check_regression(model, test_cases):
    regressions = []
    for case in test_cases:
        output = model.generate(case["input"])
        if quality(output) < quality(case["expected_output"]):
            regressions.append(case)

    return regressions
```

### When to Stop Training

**Signs to STOP (you're done):**
- Validation loss stops decreasing
- Outputs look good on test set
- Perplexity < target threshold

**Signs to STOP (you're overfitting):**
- Training loss decreases, validation loss increases
- Model memorizes training data
- Outputs are too specific to training examples

**Signs to KEEP GOING:**
- Both losses still decreasing
- Outputs are improving
- Haven't hit time/budget limit

**Early stopping implementation:**
```python
from transformers import EarlyStoppingCallback

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=3)],
)

# Stops if eval loss doesn't improve for 3 evaluations
```

### Reproducibility

**Always set seeds:**
```python
import torch
import numpy as np
import random

def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    # Make CuDNN deterministic
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

set_seed(42)
```

**Save full configuration:**
```python
import json

config = {
    "model": "microsoft/Phi-3-mini-4k-instruct",
    "lora_config": {
        "r": 16,
        "lora_alpha": 32,
        "lora_dropout": 0.05,
    },
    "training_args": {
        "learning_rate": 2e-4,
        "num_train_epochs": 3,
        "batch_size": 4,
    },
    "dataset": "summarization_v2",
    "seed": 42,
    "date": "2025-10-30",
}

with open("experiment_config.json", "w") as f:
    json.dump(config, f, indent=2)
```

**Track experiments:**
```python
# Use Weights & Biases (free for personal use)
import wandb

wandb.init(project="context-app-slm", name="phi3-summarization-v1")
wandb.config.update(config)

# Logs are automatic with transformers Trainer
trainer = Trainer(..., report_to="wandb")
```

---

## Resources & Next Steps

### Learning Resources

**Courses:**
- [Fast.ai Practical Deep Learning](https://course.fast.ai/) - FREE, best intro
- [Hugging Face NLP Course](https://huggingface.co/learn/nlp-course) - FREE, transformers focused
- [Stanford CS224N](http://web.stanford.edu/class/cs224n/) - FREE, theoretical foundations

**Books:**
- *Natural Language Processing with Transformers* (O'Reilly)
- *Speech and Language Processing* (Jurafsky & Martin) - FREE online

**Papers to Read:**
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) - Original transformer
- [LoRA](https://arxiv.org/abs/2106.09685) - Efficient fine-tuning
- [Phi-3 Technical Report](https://arxiv.org/abs/2404.14219) - Small models done right

### Communities

**Discord Servers:**
- Hugging Face Discord
- EleutherAI Discord
- r/LocalLLaMA community

**Reddit:**
- r/MachineLearning
- r/LocalLLaMA (on-device focus)
- r/LanguageTechnology

**Twitter/X:**
- @karpathy (Andrej Karpathy)
- @_philschmid (Philipp Schmid, Hugging Face)
- @rasbt (Sebastian Raschka)

### Tools & Libraries

**Essential:**
- [Transformers](https://github.com/huggingface/transformers) - Model library
- [PEFT](https://github.com/huggingface/peft) - Parameter-efficient fine-tuning
- [Datasets](https://github.com/huggingface/datasets) - Dataset management
- [Accelerate](https://github.com/huggingface/accelerate) - Distributed training

**Training Frameworks:**
- [Axolotl](https://github.com/OpenAccess-AI-Collective/axolotl) - User-friendly training
- [LLaMA Factory](https://github.com/hiyouga/LLaMA-Factory) - Web UI for training
- [TRL](https://github.com/huggingface/trl) - Reinforcement learning

**Evaluation:**
- [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) - Benchmark suite
- [MTEB](https://github.com/embeddings-benchmark/mteb) - Embedding evaluation

**Deployment:**
- [llama.cpp](https://github.com/ggerganov/llama.cpp) - Fast CPU inference
- [ONNX Runtime](https://onnxruntime.ai/) - Cross-platform inference
- [Core ML Tools](https://github.com/apple/coremltools) - iOS deployment

### Your Learning Path

**Month 1: Foundations**
- Complete Fast.ai course
- Fine-tune your first model (Phi-3 on summarization)
- Deploy to test device
- Budget: $20-50

**Month 2: Experimentation**
- Try 3-5 different fine-tuning approaches
- Test different models (Llama, Qwen, Gemma)
- Build your first production pipeline
- Budget: $50-100

**Month 3: Production**
- Optimize best model for on-device
- Implement A/B testing
- Set up continuous improvement loop
- Budget: $50-100

**Month 4-6: Advanced**
- Try distillation
- Experiment with novel architectures
- Contribute to open source
- Budget: $100-200/month

### 10 Starter Projects for Context App

**Difficulty: Easy (⭐)**
1. **Note summarization** - 1-2 sentence summaries
2. **Auto-tagging** - Classify notes into categories
3. **Duplicate detection** - Find similar notes

**Difficulty: Medium (⭐⭐)**
4. **Smart search** - Semantic search with embeddings
5. **Key fact extraction** - Pull out dates, names, numbers
6. **Sentiment analysis** - Track mood in journal entries
7. **Q&A system** - Ask questions about your notes

**Difficulty: Hard (⭐⭐⭐)**
8. **Note linking** - Automatically suggest related notes
9. **Timeline extraction** - Build chronological timelines from notes
10. **Personal assistant** - Chat interface for all Context data

**Recommended order:**
1. Start with #1 (summarization) - Teaches basics
2. Move to #4 (search) - Most useful, not too hard
3. Try #7 (Q&A) - Combines everything

### Next Steps After This Guide

**You're ready to:**
1. ✅ Fine-tune a small language model
2. ✅ Deploy it on-device
3. ✅ Evaluate model quality
4. ✅ Optimize for cost and performance

**To go deeper:**
- Study transformer architecture in detail
- Learn distributed training (multi-GPU)
- Experiment with novel techniques (RL, DPO, etc.)
- Build custom architectures

**To build Context app:**
- Start with fine-tuned Phi-3 for summarization
- Add semantic search with sentence-transformers
- Implement Q&A with RAG
- Deploy to TestFlight for user testing
- Iterate based on feedback

---

## Conclusion

**You don't need to be an ML expert to build effective SLMs.**

**The path forward:**
1. **Week 1:** Set up environment, run first fine-tuning
2. **Week 2-4:** Experiment with different approaches
3. **Month 2:** Deploy first model to Context app
4. **Month 3+:** Continuously improve based on user feedback

**Key takeaways:**
- Fine-tuning > Training from scratch (99% of the time)
- LoRA makes fine-tuning cheap and fast
- Small models (1-3B) are surprisingly capable
- On-device AI is the future (privacy, cost, speed)
- Iterate quickly, fail fast, learn continuously

**Remember:** The best model is the one you actually ship.

Good luck building! 🚀
