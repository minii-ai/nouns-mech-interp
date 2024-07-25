#!/bin/bash

python run_sae_experiment.py \
    --in_features=64 \
    --expansion_factor=32 \
    --lr=3e-4,1e-3 \
    --iterations=1000000 \
    --lambda_l1=1e-2,8e-3,6e-3,4e-3,1e-3 \
    --batch_size=8192 \
    --save_dir="../checkpoints/eric" \
    --checkpoint_every=500000 \
    --vae_embeddings_path="../data/vae_embeddings.npy" \
    --vae_checkpoint=../weights/vae \
    --concurrent_experiments=20 \
    --latent_shape=4,4,4 \
    --seed=0 \
    # --lambda_l1=1e-3,4e-4,8e-3,1e-2 \
    # --lambda_l1=5e-2,3e-2,1e-2 \
    # --save_dir="../checkpoints/sae_experiments_higher_l1" \
    # --batch_size=128 \
    # --batch_size=8192 \
