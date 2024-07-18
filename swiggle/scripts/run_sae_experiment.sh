#!/bin/bash

python run_sae_experiment.py \
    --in_features=64 \
    --expansion_factor=16 \
    --lr=1e-4 \
    --iterations=1000000 \
    --lambda_l1=1e-2 \
    --batch_size=8192 \
    --save_dir="../checkpoints/sae_experiments_high_l1" \
    --checkpoint_every=5000 \
    --vae_embeddings_path="../data/vae_embeddings.npy" \
    --concurrent_experiments=1 \
    # --lambda_l1=5e-2,3e-2,1e-2 \
    # --save_dir="../checkpoints/sae_experiments_higher_l1" \
    # --batch_size=128 \
    # --batch_size=8192 \
