#!/bin/bash

python run_sae_experiment.py \
    --in_features=64 \
    --expansion_factor=8 \
    --lr=1e-4,1e-5 \
    --iterations=1000000 \
    --batch_size=128 \
    --lambda_l1=0.01,0.005,0.001 \
    --save_dir="../checkpoints/sae_experiments" \
    --checkpoint_every=10000 \
    --vae_embeddings_path="../vae_embeddings.npy" \
    --concurrent_experiments=6 \
