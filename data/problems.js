/**
 * ML x ACS Hackathon - Problem Statements Data
 * Contains comprehensive challenge statements categorized by difficulty: Easy, Medium, Hard.
 */

export const problems = [
  {
    id: 1,
    code: "PS-01",
    title: "Smart AgriVision: Real-Time Crop Foliage Disease Detection",
    category: "Computer Vision",
    difficulty: "easy",
    shortDescription: "Develop an edge-friendly image classification and segmentation pipeline to identify foliage diseases in staple crops with high accuracy.",
    fullDescription: "Agricultural yield losses due to unmitigated leaf blights and viral strains cost farmers billions annually. Traditional lab diagnostics are slow and inaccessible to rural growers. In this challenge, participants must build a lightweight deep learning model capable of detecting and classifying 14 common crop leaf diseases under diverse ambient lighting, partial occlusions, and varied smartphone sensor resolutions.",
    objectives: [
      "Train a robust classifier or detector achieving >92% Macro F1-score across 14 disease classes.",
      "Quantize the model (INT8/FP16) to ensure sub-50ms inference time on edge hardware (e.g., Raspberry Pi 4 or mobile CPU).",
      "Produce visual heatmaps (Grad-CAM or attention maps) highlighting diseased leaf regions for farmer trust."
    ],
    constraints: [
      "Model parameters must not exceed 15 Million.",
      "Input resolution constrained to max 512x512 pixels.",
      "Inference time must remain under 60ms on single CPU thread."
    ],
    evaluationMetric: "Macro F1-Score (70%) + Model Size / Latency Score (30%)",
    dataset: {
      name: "PlantVillage & FieldFoliage Curated Dataset",
      url: "https://github.com/spMohanty/PlantVillage-Dataset",
      description: "Over 54,000 annotated field and laboratory images of healthy and diseased leaves across 14 crops.",
      size: "820 MB",
      format: "PNG / JPEG with CSV metadata and bounding boxes"
    },
    tags: ["Computer Vision", "PyTorch", "Edge AI", "MobileNet", "Grad-CAM"]
  },
  {
    id: 2,
    code: "PS-02",
    title: "SentiPulse: Multilingual Clinical Sentiment & Triage Classifier",
    category: "NLP & Healthcare",
    difficulty: "easy",
    shortDescription: "Build a multilingual NLP intent and triage classifier to prioritize urgent patient teleconsultation messages in 4 Indian languages.",
    fullDescription: "Rural telehealth helplines receive tens of thousands of unstructured voice-to-text transcripts and direct chat messages daily. Rapid triage between mild symptoms and critical emergencies is life-saving. Teams will build an NLP pipeline that ingests multilingual transcribed patient texts (Hindi, Tamil, Telugu, and English) and classifies intent into triage urgency levels (Critical, Moderate, Informational).",
    objectives: [
      "Accurately categorize triage urgency across noisy, code-mixed patient statements.",
      "Extract clinical symptom entities (e.g., duration, fever severity, oxygen difficulty).",
      "Demonstrate zero-shot or few-shot resilience against typographical noise and colloquial idioms."
    ],
    constraints: [
      "Pretrained transformer encoders cannot exceed 125M parameters (e.g., RoBERTa-base, IndicBERT, MuRIL).",
      "No proprietary closed-source API calls allowed during offline evaluation.",
      "Latency budget: Under 120ms per transcript batch."
    ],
    evaluationMetric: "Weighted F1 on Critical Triage Class (50%) + Macro F1 (30%) + Entity Span Recall (20%)",
    dataset: {
      name: "IndicTeleHealth Multi-Dialect Corpus",
      url: "https://huggingface.co/datasets/ai4bharat/IndicSentiment",
      description: "18,500 de-identified multilingual doctor-patient text snippets annotated for urgency and symptom severity.",
      size: "145 MB",
      format: "JSON Lines / UTF-8 text with NER offsets"
    },
    tags: ["NLP", "Transformers", "IndicBERT", "Healthcare AI", "Triage"]
  },
  {
    id: 3,
    code: "PS-03",
    title: "RoboNav-Sim: LiDAR & Depth Obstacle Avoidance for AMRs",
    category: "Autonomous Systems & Robotics",
    difficulty: "medium",
    shortDescription: "Design a collision-free local trajectory planner for Autonomous Mobile Robots operating in dynamic indoor warehouse environments.",
    fullDescription: "Autonomous Mobile Robots (AMRs) in modern fulfilment centers navigate congested aisles alongside human pickers, sudden forklift traffic, and dropped merchandise. Traditional heuristic planners (like DWA or TEB) often suffer from freezing robot problems or jerky oscillations in dense dynamic bottlenecks. Participants must develop a learning-augmented or hybrid local planner using 2D/3D LiDAR scans and wheel odometry.",
    objectives: [
      "Navigate an AMR through 10 progressively challenging warehouse simulation maps without collisions.",
      "Minimize trajectory jerk, total traversal time, and path clearance violations.",
      "Demonstrate robust behavior in static and dynamic obstacle scenarios (moving pedestrians at 1.2 m/s)."
    ],
    constraints: [
      "Control loop update rate must achieve >= 20 Hz (50ms per control cycle).",
      "Actuator limits: Max linear velocity 1.5 m/s, max angular velocity 1.2 rad/s.",
      "Must run inside provided Gazebo / ROS2 humble environment."
    ],
    evaluationMetric: "Trajectory Success Rate (40%) + Mean Time-to-Goal (30%) + Smoothness / Clearance (30%)",
    dataset: {
      name: "WarehouseSim-AMR Benchmark Suite",
      url: "https://github.com/aws-robotics/aws-robomaker-small-warehouse-world",
      description: "ROS2 bag files, Gazebo simulation worlds with synthetic LiDAR scans, dynamic human trajectories, and odometry logs.",
      size: "2.4 GB",
      format: "ROS2 Bags (.db3), URDF & Gazebo SDF worlds"
    },
    tags: ["Robotics", "ROS2", "LiDAR", "Path Planning", "Reinforcement Learning"]
  },
  {
    id: 4,
    code: "PS-04",
    title: "ZeroFault: Multimodal Industrial Anomaly Detection",
    category: "Multimodal AI & IoT",
    difficulty: "medium",
    shortDescription: "Detect micro-fractures and thermal runaway risks in automated manufacturing using synchronized high-speed video and acoustic telemetry.",
    fullDescription: "High-precision computer numerical control (CNC) and semiconductor assembly lines generate simultaneous acoustic emissions, motor vibration logs, and high-fps visual inspections. Relying on a single modality results in either false positives from ambient factory noise or visual occlusions from cooling lubricants. This challenge requires participants to build a multimodal self-supervised representation learner that flags abnormal equipment wear before catastrophic tool breakage.",
    objectives: [
      "Fuse 12-channel acoustic accelerometer time-series with 120 FPS visual inspection frames.",
      "Establish an unsupervised or semi-supervised anomaly scoring boundary with <2% false alarm rate on clean reference runs.",
      "Pinpoint anomaly onset timestamp within 150 milliseconds of mechanical degradation."
    ],
    constraints: [
      "Only 50 normal operation runs provided for training (unsupervised / one-class learning setup).",
      "Zero ground-truth anomaly examples permitted during preliminary model calibration."
    ],
    evaluationMetric: "AUROC on Anomaly Detection (50%) + Time-to-Detection Accuracy (30%) + F1-Score (20%)",
    dataset: {
      name: "MIMII & CastDefect Multimodal Industrial Benchmark",
      url: "https://zenodo.org/record/3384388",
      description: "Synchronized 16kHz audio, multi-axis triaxial accelerometer signals, and high-resolution industrial camera clips.",
      size: "4.8 GB",
      format: "WAV audio, CSV vibrations, MP4 / H.264 video streams"
    },
    tags: ["Multimodal", "Anomaly Detection", "Self-Supervised", "Signal Processing", "Industry 4.0"]
  },
  {
    id: 5,
    code: "PS-05",
    title: "BioGraph: Geometric GNN for Protein-Ligand Binding Affinity",
    category: "Graph ML & Drug Discovery",
    difficulty: "medium",
    shortDescription: "Predict binding affinity (Kd/Ki) and pose validity for small molecule inhibitors using SE(3)-equivariant graph neural networks.",
    fullDescription: "Accelerating computational drug discovery requires estimating whether a novel candidate chemical molecule binds effectively to target disease proteins without requiring multi-day molecular dynamics (MD) simulations. Teams will implement an E(3) or SE(3)-equivariant Graph Neural Network that ingests 3D coordinates, atomic numbers, and chemical bond graphs to predict experimental binding affinities.",
    objectives: [
      "Model 3D spatial rotational and translational equivariance in molecular ligand-pocket complexes.",
      "Predict binding affinity values with low root-mean-square error (RMSE) on PDBbind test targets.",
      "Generate atom-level contribution scores to elucidate key hydrogen bond and hydrophobic interactions."
    ],
    constraints: [
      "Input representations must explicitly account for 3D atomic coordinates (not solely 2D SMILES strings).",
      "Model training must complete within a 4-hour budget on a single NVIDIA T4/V100 GPU."
    ],
    evaluationMetric: "Pearson Correlation Coefficient (r) (50%) + RMSE in pKd/pKi (30%) + Pose Ranking Accuracy (20%)",
    dataset: {
      name: "PDBbind v2020 Refined Core Set",
      url: "http://www.pdbbind.org.cn/",
      description: "Over 5,300 curated 3D protein-ligand crystal complexes with experimentally measured binding constants.",
      size: "1.9 GB",
      format: "PDB, MOL2, and SDF chemical structure formats"
    },
    tags: ["Graph ML", "PyTorch Geometric", "Equivariant GNN", "Bioinformatics", "Drug Discovery"]
  },
  {
    id: 6,
    code: "PS-06",
    title: "SwarmSync: Decentralized Drone Swarm in GPS-Denied Environments",
    category: "Robotics & Multi-Agent RL",
    difficulty: "hard",
    shortDescription: "Formulate a decentralized cooperative flight policy for quadrotor swarms navigating dense subterranean tunnels with zero GPS.",
    fullDescription: "Search-and-rescue operations inside collapsed subterranean structures or deep mining shafts operate in GPS-denied, communication-constrained environments. A swarm of 6 quadrotors must collectively explore, map, and navigate unknown 3D corridors while maintaining line-of-sight communication mesh relays, avoiding inter-agent collisions, and surviving intermittent sensor dropouts. Participants will deploy Multi-Agent Reinforcement Learning (MARL) or decentralized consensus controllers.",
    objectives: [
      "Devise a decentralized policy executing independently on each drone agent using local onboard VIO and ultra-wideband (UWB) ranges.",
      "Maximize mapped volumetric exploration percentage within a strict 5-minute mission battery window.",
      "Guarantee 0% inter-drone collision rate and maintain continuous swarm connectivity."
    ],
    constraints: [
      "Ad-hoc inter-agent radio communication limited to 50 kbps packet bursts within a 15-meter sphere.",
      "No centralized server or global observer allowed during real-time flight.",
      "Full 6-DOF nonlinear quadrotor dynamics with realistic battery drain modeling."
    ],
    evaluationMetric: "Explored 3D Volume (40%) + Zero Collision Guarantee (30%) + Swarm Connectivity Time (30%)",
    dataset: {
      name: "SubT-Tunnel Autonomous Swarm Simulation Suite",
      url: "https://www.subtchallenge.com/",
      description: "Simulated subterranean cave meshes, Crazyflie quadrotor physics plugins, noisy sensor profiles, and UWB ranging datasets.",
      size: "6.2 GB",
      format: "PyBullet / Isaac Gym environment & Rosbag trajectory benchmarks"
    },
    tags: ["Multi-Agent RL", "Swarm Robotics", "Decentralized Control", "Isaac Gym", "UWB & VIO"]
  },
  {
    id: 7,
    code: "PS-07",
    title: "MLC x ACS hackathon website",
    category: "Systems ML & Edge AI",
    difficulty: "hard",
    shortDescription: "build a website for a small hackathon",
    fullDescription: "Build a small website for acs x mlc hackathon conducted by mlc and acs",
    objectives: [
      "Implement a fast draft-model speculative verification pipeline maintaining 100% token distribution equivalence to greedy decoding.",
      "Achieve >= 18 tokens/second throughput on edge embedded hardware under 15W power constraints.",
      "Develop fused dequantization-GEMM kernels with zero memory overhead spikes."
    ],
    constraints: [
      "Target execution platform: 8GB total unified system memory ceiling.",
      "Perplexity degradation on WikiText-2 / GSM8k must not exceed 0.25 compared to baseline FP16 model.",
      "Must use open-source weights (Llama-3-8B-Instruct or Gemma-2-9B-It)."
    ],
    evaluationMetric: "Tokens Per Second (TPS) (50%) + Memory Footprint (25%) + Perplexity Preservation (25%)",
    dataset: {
      name: "EdgeBench LLM Evaluation Suite & Calibration Corpora",
      url: "https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k",
      description: "20,000 conversational prompts, multi-turn tool-calling traces, calibration datasets, and automated latency profiling harnesses.",
      size: "780 MB",
      format: "JSON, Parquet, and Safetensors checkpoints"
    },
    tags: ["Systems ML", "Triton", "Quantization", "Speculative Decoding", "Edge Robotics"]
  },
  {
    id: 8,
    code: "PS-08",
    title: "EdgeLLM-Quant: Sub-20ms Speculative Decoding on Embedded Hardware",
    category: "Systems ML & Edge AI",
    difficulty: "hard",
    shortDescription: "Build a custom tensor compilation kernel and speculative decoding engine for 7B LLMs on embedded robotics accelerators.",
    fullDescription: "Autonomous humanoid and service robots require onboard conversational reasoning and immediate task planning without cloud latency and connectivity failure risks. Running contemporary 7B/8B parameter models on constrained embedded systems (e.g., Jetson Orin Nano, 8GB unified RAM) typically yields unacceptable speeds (< 4 tokens/sec). In this systems-engineering challenge, participants will combine 4-bit weight activation quantization (AWQ/GPTQ) with speculative draft models and custom fused CUDA/Triton kernels to achieve interactive conversational throughput.",
    objectives: [
      "Implement a fast draft-model speculative verification pipeline maintaining 100% token distribution equivalence to greedy decoding.",
      "Achieve >= 18 tokens/second throughput on edge embedded hardware under 15W power constraints.",
      "Develop fused dequantization-GEMM kernels with zero memory overhead spikes."
    ],
    constraints: [
      "Target execution platform: 8GB total unified system memory ceiling.",
      "Perplexity degradation on WikiText-2 / GSM8k must not exceed 0.25 compared to baseline FP16 model.",
      "Must use open-source weights (Llama-3-8B-Instruct or Gemma-2-9B-It)."
    ],
    evaluationMetric: "Tokens Per Second (TPS) (50%) + Memory Footprint (25%) + Perplexity Preservation (25%)",
    dataset: {
      name: "EdgeBench LLM Evaluation Suite & Calibration Corpora",
      url: "https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k",
      description: "20,000 conversational prompts, multi-turn tool-calling traces, calibration datasets, and automated latency profiling harnesses.",
      size: "780 MB",
      format: "JSON, Parquet, and Safetensors checkpoints"
    },
    tags: ["Systems ML", "Triton", "Quantization", "Speculative Decoding", "Edge Robotics"]
  }
];

export function getProblemById(id) {
  return problems.find(p => p.id === Number(id));
}

export function getProblemsByDifficulty(difficulty) {
  if (!difficulty || difficulty === "all") {
    return problems;
  }
  return problems.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
}

export function getDifficultyStats() {
  const counts = {
    all: problems.length,
    easy: 0,
    medium: 0,
    hard: 0
  };
  problems.forEach(p => {
    if (counts[p.difficulty] !== undefined) {
      counts[p.difficulty]++;
    }
  });
  return counts;
}
