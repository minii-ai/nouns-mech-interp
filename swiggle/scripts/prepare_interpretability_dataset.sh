#!/bin/bash

python3 prepare_interpretability_dataset.py \
    --sae_checkpoint="../checkpoints/sae_experiments_longer_warmup/lr=3.0e-04_l1=8.0e-02" \
    --vae_checkpoint="../weights/vae" \
    --output_dir="../data/interp_dataset/sae_experiments_longer_warmup/lr=3.0e-04_l1=8.0e-02" \
    --decoded_features_dir="../data/sae_decoded_features/sae_experiments_longer_warmup/lr=3.0e-04_l1=8.0e-02" \
    --vae_embeddings_path="../data/vae_embeddings.npy" \
    --k=64 \
    # --sae_checkpoint="../checkpoints/sae_experiments/lr=3.0e-04_l1=5.0e-03" \
    # --sae_checkpoint="../checkpoints/sae_experiments/lr=5.0e-04_l1=5.0e-03" \
    # --sae_checkpoint="../checkpoints/sae_experiments2/lr=5.0e-04_l1=1.0e-03" \
