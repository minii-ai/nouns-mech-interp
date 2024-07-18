#!/bin/bash

python3 jsonify_sae_features.py \
    --sae_checkpoint="../weights/sae" \
    --output_path="../data/features.json" \
    --vae_embeddings_path="../data/vae_embeddings.npy" \
    --k=9 \
    # --sae_checkpoint="../checkpoints/sae_experiments/lr=5.0e-04_l1=5.0e-03" \