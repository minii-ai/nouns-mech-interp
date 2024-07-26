#!/bin/bash

python run_sae_experiment.py \
    --in_features=64 \
    --expansion_factor=32 \
    --lr=1e-4,2e-4,4e-4,5e-5 \
    --iterations=1000000 \
    --k=5,10,15,20 \
    --activation=TopK \
    --batch_size=1024 \
    --save_dir="../checkpoints/topk" \
    --checkpoint_every=10000 \
    --vae_embeddings_path="../data/vae_embeddings.npy" \
    --vae_checkpoint=../weights/vae \
    --concurrent_experiments=20 \
    --latent_shape=4,4,4 \
    --seed=0 \
    # --lambda_l1=1e-1,8e-2,4e-2,1e-2,8e-3 \
    # --lambda_l1=1e-3,4e-4,8e-3,1e-2 \
    # --lambda_l1=5e-2,3e-2,1e-2 \
    # --save_dir="../checkpoints/sae_experiments_higher_l1" \
    # --batch_size=128 \
    # --batch_size=8192 \
