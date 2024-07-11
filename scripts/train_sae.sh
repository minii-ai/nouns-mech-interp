#!/bin/bash

python train_sae.py \
    --in_features=64 \
    --expansion_factor=8 \
    --lr=3e-4 \
    --iterations=250000 \
    --batch_size=128 \
    --lambda_l1=0.004 \
    --save_dir="../checkpoints/sae" \
    --checkpoint_every=500 \
    --vae_embeddings_path="../vae_embeddings.npy"
