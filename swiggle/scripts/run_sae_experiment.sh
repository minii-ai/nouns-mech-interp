#!/bin/bash

python run_sae_experiment.py \
    --in_features=64 \
    --expansion_factor=16 \
    --lr=1e-3,5e-3,1e-2 \
    --iterations=1000000 \
    --lambda_l1=1e-2,8e-3,6e-3,4e-3 \
    --batch_size=8192 \
    --save_dir="../checkpoints/sae_awesome" \
    --checkpoint_every=5000 \
    --vae_embeddings_path="../data/vae_embeddings.npy" \
    --vae_checkpoint=../weights/vae \
    --concurrent_experiments=20 \
    --latent_shape=4,4,4 \
    --seed=32 \
    # --lambda_l1=5e-2,3e-2,1e-2 \
    # --save_dir="../checkpoints/sae_experiments_higher_l1" \
    # --batch_size=128 \
    # --batch_size=8192 \
