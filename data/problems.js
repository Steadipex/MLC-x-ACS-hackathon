/**
 * ML x ACS Hackathon - Problem Statements Data
 * Official ML × ACS hackathon problem statements, categorized by difficulty: Easy, Medium, Hard.
 */

export const problems = [
  // Official problem statements (ML × ACS problem statement document)
  {
    "id": 1,
    "code": "EVS-01",
    "title": "Water Quality Testing (200-row Benchmark)",
    "category": "Environmental Science",
    "difficulty": "easy",
    "shortDescription": "Water quality is a crucial aspect of environmental management, and it is essential to measure various physical, chemical, and biological parameters to monitor it effectively.",
    "fullDescription": "Water quality is a crucial aspect of environmental management, and it is essential to measure various physical, chemical, and biological parameters to monitor it effectively. This dataset of 200 rows contains measurements of six critical water quality parameters widely used in water quality monitoring and analysis. The dataset provides a representative snapshot of water quality and can be used for various research, education, and decision-making purposes.",
    "dataset": {
      "name": "Kaggle dataset",
      "url": "https://www.kaggle.com/datasets/shreyanshverma27/water-quality-testing"
    },
    "links": [
      {
        "label": "Dataset (Kaggle)",
        "url": "https://www.kaggle.com/datasets/shreyanshverma27/water-quality-testing"
      }
    ],
    "tags": [
      "Tabular Data",
      "Water Quality",
      "Environmental Monitoring"
    ]
  },
  {
    "id": 2,
    "code": "MAT-01",
    "title": "Predicting Solubility of Molecules",
    "category": "Materials & Chemistry",
    "difficulty": "easy",
    "shortDescription": "Predicting solubility of molecules from molecular structures and cheminformatics descriptors using machine learning models.",
    "fullDescription": "Predicting solubility of molecules from molecular structures and cheminformatics descriptors using machine learning models.",
    "dataset": {
      "name": "GitHub repository",
      "url": "https://github.com/dataprofessor/code/blob/master/python/cheminformatics_predicting_solubility.ipynb"
    },
    "links": [
      {
        "label": "Notebook (GitHub)",
        "url": "https://github.com/dataprofessor/code/blob/master/python/cheminformatics_predicting_solubility.ipynb"
      },
      {
        "label": "Reference paper (DOI)",
        "url": "https://doi.org/10.1021/ci034243x"
      }
    ],
    "tags": [
      "Cheminformatics",
      "Regression",
      "Solubility"
    ]
  },
  {
    "id": 3,
    "code": "EVS-02",
    "title": "Water Quality Assessment and Prediction in Indian Regions",
    "category": "Environmental Science",
    "difficulty": "easy",
    "shortDescription": "Build a predictive model that can classify whether a given water sample is “safe” or “unsafe” based on its chemical and physical parameters.",
    "fullDescription": "Measurements of water quality parameters from various locations in India. Features include pH, hardness, solids, chloramines, sulfate, conductivity, organic carbon, trihalomethanes, turbidity, etc. Data includes labels for water quality classification (e.g. “safe” vs “unsafe”) or continuous scores if provided (from Indian Water Quality Data).",
    "objectives": [
      "Build a predictive model that can classify whether a given water sample is “safe” or “unsafe” based on its chemical and physical parameters.",
      "Optionally, also predict a continuous water quality index or score (regression).",
      "Perform feature importance/analysis: identify which water quality parameters most strongly affect safety classification or quality score."
    ],
    "outcome": [
      "A user-friendly front-end tool where users (e.g., municipal authorities, environmental scientists) can input water parameter readings and get (a) classification: safe or unsafe, (b) quality score or risk level.",
      "Visualizations: show feature contributions, maybe slider bars for each parameter, threshold indicators; perhaps comparison of multiple readings; map-based view if location metadata is present.",
      "Performance dashboard: show classification metrics (accuracy, precision, recall), confusion matrix; for regression version, error metrics like RMSE, MAE."
    ],
    "dataset": {
      "name": "Kaggle dataset",
      "url": "https://www.kaggle.com/datasets/anbarivan/indian-water-quality-data"
    },
    "links": [
      {
        "label": "Dataset (Kaggle)",
        "url": "https://www.kaggle.com/datasets/anbarivan/indian-water-quality-data"
      }
    ],
    "tags": [
      "Classification",
      "Water Quality",
      "Feature Importance"
    ]
  },
  {
    "id": 4,
    "code": "MED-01",
    "title": "Detecting Parkinson’s Disease from Drawing Patterns",
    "category": "Medical AI",
    "difficulty": "easy",
    "shortDescription": "Develop a model that can distinguish between drawings made by Parkinson’s disease patients vs healthy individuals, based on the features of the drawings (shape, smoothness/jerkiness…",
    "fullDescription": "Hand-drawn sketches/drawings collected from participants (both Parkinson’s disease patients and controls). Drawings include tasks such as spirals, lines, or other prescribed figures. Data includes labels indicating whether the drawing was made by someone with Parkinson’s disease, along with metadata such as drawing speed or pressure, if available.",
    "objectives": [
      "Develop a model that can distinguish between drawings made by Parkinson’s disease patients vs healthy individuals, based on the features of the drawings (shape, smoothness/jerkiness, pressure, timing, etc.).",
      "Explore different approaches: image-based (treat the drawing as bitmap), vector/trace-based (if stroke order / timing data is available), or feature engineering (line smoothness, curvature, speed).",
      "Make a multimodal classification comparison in terms of bias-variance trade-offs, prediction times, and memory footprints to determine the best models.",
      "Optional: predict severity (if any metadata available), or classify type of drawing task."
    ],
    "outcome": [
      "A front-end tool (web or app) where a user can upload or draw an image (e.g. spiral drawing or line drawing) and receive a prediction: Parkinson’s vs no Parkinson’s, including confidence scores.",
      "Provide visualization of features: perhaps overlay smoothing / jerkiness, show which parts of the drawing contributed to the decision.",
      "Dashboard showing model performance: accuracy, precision / recall / F1-score, confusion matrix, ROC curve."
    ],
    "dataset": {
      "name": "Kaggle dataset",
      "url": "https://www.kaggle.com/datasets/kmader/parkinsons-drawings"
    },
    "links": [
      {
        "label": "Dataset (Kaggle)",
        "url": "https://www.kaggle.com/datasets/kmader/parkinsons-drawings"
      }
    ],
    "tags": [
      "Computer Vision",
      "Healthcare",
      "Classification"
    ]
  },
  {
    "id": 5,
    "code": "EVS-03",
    "title": "Hourly Air Quality Prediction via Sensor Array",
    "category": "Environmental Science",
    "difficulty": "medium",
    "shortDescription": "Build a model that can predict a target air quality measure (e.g. pollutant concentration, or an aggregated air quality index) based on the sensor readings and possibly other features…",
    "fullDescription": "Hourly averaged responses from an array of 5 metal-oxide chemical sensors measuring various air quality related variables. The dataset contains ~9,357 instances.",
    "objectives": [
      "Build a model that can predict a target air quality measure (e.g. pollutant concentration, or an aggregated air quality index) based on the sensor readings and possibly other features such as time of day.",
      "Optionally, detect anomalies or spikes in pollution (e.g. unusually high pollutant levels) from sensor signals.",
      "Explore data preprocessing: handling missing values, sensor drift, normalization; feature engineering (temporal features like hour of day, day of week).",
      "Implement hyper-parameter tuning using Bayesian optimization and randomized cross-validation to improve prediction accuracy and reduce overfitting.",
      "Apply model stacking to capture spatial and temporal dynamics.",
      "Evaluate model performance using metrics such as R², MAE, and MSE."
    ],
    "outcome": [
      "A front-end tool (web or app) where a user can input current sensor values, time, etc., and the model returns the predicted air quality measure / pollutant level / AQI.",
      "Include visualization: time-series plots (showing predictions vs past observations), alert system (warning if predicted pollutant level exceeds safe threshold), graphs of sensor readings, and perhaps a map or geospatial view if location data is available.",
      "Dashboard showing how well the model performs (error metrics like RMSE, MAE, maybe classification metrics if thresholds used), trending predictions, and historical data comparison."
    ],
    "dataset": {
      "name": "Kaggle dataset",
      "url": "https://www.kaggle.com/datasets/fedesoriano/air-quality-data-set/data"
    },
    "links": [
      {
        "label": "Dataset (Kaggle)",
        "url": "https://www.kaggle.com/datasets/fedesoriano/air-quality-data-set/data"
      }
    ],
    "tags": [
      "Time Series",
      "Air Quality",
      "Ensemble Models"
    ]
  },
  {
    "id": 6,
    "code": "EVS-04",
    "title": "Predicting Air Quality Index (AQI) Across Global Cities",
    "category": "Environmental Science",
    "difficulty": "medium",
    "shortDescription": "Develop a predictive model to estimate the AQI for a given city based on input features.",
    "fullDescription": "The dataset contains Air Quality Index (AQI) values for various pollutants across multiple cities worldwide. It includes features such as pollutant concentrations, meteorological data, and temporal information.",
    "objectives": [
      "Develop a predictive model to estimate the AQI for a given city based on input features.",
      "Explore different modeling techniques, including regression models and machine learning algorithms.",
      "Evaluate model performance using appropriate metrics and validate findings through cross-validation or external datasets."
    ],
    "outcome": [
      "A user-friendly web application where users can input city and date information to receive predicted AQI values.",
      "Visualizations to interpret model predictions, such as feature importance and temporal trends.",
      "Option to upload custom datasets for prediction and analysis."
    ],
    "dataset": {
      "name": "Kaggle dataset",
      "url": "https://www.kaggle.com/datasets/hasibalmuzdadid/global-air-pollution-dataset"
    },
    "links": [
      {
        "label": "Dataset (Kaggle)",
        "url": "https://www.kaggle.com/datasets/hasibalmuzdadid/global-air-pollution-dataset"
      }
    ],
    "tags": [
      "Regression",
      "AQI",
      "Global Cities"
    ]
  },
  {
    "id": 7,
    "code": "MAT-02",
    "title": "Predicting Material Performance from Experimental Data",
    "category": "Materials & Chemistry",
    "difficulty": "medium",
    "shortDescription": "Build a predictive model that links material features and processing/structure parameters to a target functional property (for example: electrical conductivity, stability under certain…",
    "fullDescription": "Supplementary experimental data from “Nature-style” publication (Springer), possibly including measurements of material compositions, processing parameters, structural characterizations (e.g. crystallography, morphology), and functional properties (e.g. conductivity, optical absorbance, stability). Data is in spreadsheet form (xlsx) with multiple features (input variables) and outcome measurements.",
    "objectives": [
      "Build a predictive model that links material features and processing/structure parameters to a target functional property (for example: electrical conductivity, stability under certain conditions, or optical performance) depending on what the dataset provides.",
      "Explore models ranging from simple regressors (linear regression, tree-based) to more complex methods (random forests, gradient boosting, neural networks).",
      "Also look into feature selection / importance to find which input variables most influence the output property.",
      "Possibly incorporate data preprocessing: handling missing/erroneous entries, normalization/scaling; if there are categorical parameters, encoding them; maybe data augmentation or extrapolation for unseen parameter combinations."
    ],
    "outcome": [
      "A front-end tool (web app) where a user (e.g. materials scientist) can input values of the input variables (composition, processing settings, structural features) and get a prediction of the target functional property, along with confidence intervals or error estimates.",
      "The UI should allow the user to explore “what if” scenarios: by changing input parameters and seeing how the property changes; perhaps sliders to vary compositions or processing settings.",
      "Visualization of feature importance, model performance metrics (RMSE, MAE, R²), and possibly plots comparing predicted vs actual values.",
      "Also allow upload of batches of data (e.g. Excel or CSV) to get predictions collectively."
    ],
    "dataset": {
      "name": "Springer supplementary data (XLSX)",
      "url": "https://static-contentob.springer.com/esm/art%3A10.1038%2Fs44160-022-00233-y/MediaObjects/44160_2022_233_MOESM2_ESM.xlsx"
    },
    "links": [
      {
        "label": "Dataset (Springer supplementary XLSX)",
        "url": "https://static-contentob.springer.com/esm/art%3A10.1038%2Fs44160-022-00233-y/MediaObjects/44160_2022_233_MOESM2_ESM.xlsx"
      }
    ],
    "tags": [
      "Materials Informatics",
      "Regression",
      "Feature Selection"
    ]
  },
  {
    "id": 8,
    "code": "MAT-03",
    "title": "Powder Particle Classification using SEM Images",
    "category": "Materials & Chemistry",
    "difficulty": "medium",
    "shortDescription": "Build a classification model that, given an SEM image (or cropped image of a single powder particle), predicts which powder type / material / alloy it belongs to (e.g. differentiating…",
    "fullDescription": "Scanning Electron Microscopy (SEM) images of powder particles from different materials/alloys (e.g., AlSiMg, 316L stainless steel, TiAlV). The dataset includes raw SEM images, labels by powder type, contour coordinate files, and object summary files listing particle features (size, shape, contours).",
    "objectives": [
      "Build a classification model that, given an SEM image (or cropped image of a single powder particle), predicts which powder type / material / alloy it belongs to (e.g. differentiating AlSiMg vs 316L vs TiAlV).",
      "Explore multiple approaches: traditional feature engineering (particle shape, size, contour metrics, texture) + classifiers (e.g. XGBoost, Random Forest); deep learning (CNNs) directly from images; object detection / segmentation to separate particles from background (if needed).",
      "Optionally, evaluate how well models generalize across different imaging conditions (contrast, magnification) if such variation exists."
    ],
    "outcome": [
      "A web-based tool (or desktop app) where a user can upload: either a raw SEM image containing many powder particles, or cropped images of individual particles and the tool outputs the predicted powder type (material/alloy).",
      "Visual feedback: highlight detected particles (if from raw image), show which particle was classified as which type; show confidence/probability scores; optionally show which features influenced prediction (shape, texture etc.).",
      "Performance dashboard: report classification accuracy, confusion matrix, per-class precision/recall; if possible show feature importances.",
      "If image upload has multiple particles, allow users to get summary statistics: e.g., distribution of predicted materials, particle size distributions."
    ],
    "dataset": {
      "name": "GitHub repository",
      "url": "https://github.com/catauggie/AM-Powder-Classification"
    },
    "links": [
      {
        "label": "Dataset / code (GitHub)",
        "url": "https://github.com/catauggie/AM-Powder-Classification"
      }
    ],
    "tags": [
      "Computer Vision",
      "SEM Images",
      "Classification"
    ]
  },
  {
    "id": 9,
    "code": "MED-02",
    "title": "Brain Tumor Classification / Medical Image Analysis from MRI Scans",
    "category": "Medical AI",
    "difficulty": "medium",
    "shortDescription": "Classify brain MRI scans into tumor types (or Alzheimer's stages) with machine learning and deep learning models, and compare at least three of them.",
    "fullDescription": "Magnetic Resonance Imaging (MRI) brain scans of patients, labeled with existing group categories. In some descriptions, this covers tumor classes (glioma, meningioma, nontumor, pituitary), while in others, it targets Alzheimer's staging labels (Non-, Very Mild-, Mild-, Moderate-Demented). Data preprocessing (resizing, normalization) is required.",
    "objectives": [
      "Extract meaningful parametric/structural features from MRI scans (e.g., texture, shape, fractal dimension).",
      "Develop and train predictive machine learning or deep learning models that classify MRI images into tumor vs no tumor / specific tumor type, or stage prediction for Alzheimer's disease.",
      "Assess the performance of at least three highly accurate models to validate clinical reliability.",
      "Optionally extend to segment the tumor region within images (if enough annotated data or via weak supervision)."
    ],
    "outcome": [
      "A web-based tool or app where a user (e.g. clinician or student) can upload an MRI image and obtain a prediction.",
      "The UI should include confidence scores, where possible heatmaps / visualization (e.g. Grad-CAM or saliency) to show which part of the image the model focused on.",
      "Compare multiple images, view performance metrics (accuracy, confusion matrix), and download reports."
    ],
    "dataset": {
      "name": "Kaggle dataset",
      "url": "https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset"
    },
    "links": [
      {
        "label": "Dataset (Kaggle)",
        "url": "https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset"
      }
    ],
    "tags": [
      "Medical Imaging",
      "MRI",
      "Deep Learning"
    ]
  },
  {
    "id": 10,
    "code": "MED-03",
    "title": "Retinal Disease Classification (OCT) and Pediatric Pneumonia Diagnosis (Chest X-Ray)",
    "category": "Medical AI",
    "difficulty": "medium",
    "shortDescription": "Build a deep learning–based classification framework leveraging transfer learning to achieve expert-level diagnostic accuracy on OCT images and pneumonia classification on chest X-rays.",
    "fullDescription": "A large public dataset of retinal Optical Coherence Tomography (OCT) images labeled across 4 classes: Normal retina, Choroidal Neovascularization (CNV), Diabetic Macular Edema (DME), and Drusen, alongside Chest X-Ray images for pediatric pneumonia.",
    "objectives": [
      "Build a deep learning–based classification framework leveraging transfer learning to achieve expert-level diagnostic accuracy on OCT images and pneumonia classification on chest X-rays.",
      "Provide interpretable outputs by highlighting key image regions.",
      "Ensure careful data splitting (train/val/test) to avoid data leakage (especially when serial OCT slices are similar)."
    ],
    "outcome": [
      "A web-based tool or desktop app where a user (eye-care professional or student) can upload an OCT image or Chest X-Ray and get the predicted class with confidence or probability scores.",
      "Visual output: display a heat map / highlight of regions that contributed most to the classification.",
      "Performance dashboard: show accuracy, confusion matrix, recall/sensitivity per class, and ROC curves."
    ],
    "dataset": {
      "name": "Kaggle dataset",
      "url": "https://www.kaggle.com/datasets/anirudhcv/labeled-optical-coherence-tomography-oct"
    },
    "links": [
      {
        "label": "Dataset (Kaggle)",
        "url": "https://www.kaggle.com/datasets/anirudhcv/labeled-optical-coherence-tomography-oct"
      }
    ],
    "tags": [
      "Medical Imaging",
      "Transfer Learning",
      "OCT / X-Ray"
    ]
  },
  {
    "id": 11,
    "code": "MED-04",
    "title": "AI-Driven Discovery of Synergistic Drug Combinations for Pancreatic Cancer",
    "category": "Medical AI",
    "difficulty": "hard",
    "shortDescription": "Develop a machine learning model to predict the synergy score of drug combinations based on their molecular descriptors.",
    "fullDescription": "The PANC1 dataset comprises molecular descriptors of individual compounds and their combinations, along with corresponding experimental synergy scores. These data are stored in CSV format and include features such as chemical properties, molecular fingerprints, and synergy scores derived from in vitro experiments.",
    "objectives": [
      "Develop a machine learning model to predict the synergy score of drug combinations based on their molecular descriptors.",
      "Explore various modeling techniques, including regression models, ensemble methods, and deep learning approaches.",
      "Evaluate model performance using appropriate metrics and validate findings through cross-validation or external datasets."
    ],
    "outcome": [
      "A user-friendly web application where users can input molecular descriptors of two or more drugs and receive a predicted synergy score.",
      "Visualizations to interpret model predictions, such as feature importance plots or partial dependence plots.",
      "Option to upload custom datasets for prediction and analysis."
    ],
    "dataset": {
      "name": "GitHub repository",
      "url": "https://github.com/ncats/PANC1"
    },
    "links": [
      {
        "label": "Dataset / code (GitHub)",
        "url": "https://github.com/ncats/PANC1"
      }
    ],
    "tags": [
      "Drug Discovery",
      "Regression",
      "Ensemble Methods"
    ]
  },
  {
    "id": 12,
    "code": "MAT-04",
    "title": "Organic Chemistry Reaction Prediction via SMILES",
    "category": "Materials & Chemistry",
    "difficulty": "hard",
    "shortDescription": "Predict the products of organic chemistry reactions from reactants written in SMILES, using a dataset of more than 9 lakh single-product reactions.",
    "fullDescription": "SMILES (Simplified Molecular Input Line Entry System) is a line notation (a typographical method using printable characters) for entering and representing molecules and reactions. This dataset contains more than 9 lakhs of single product reactions in SMILES format. The first column contains reactants and the second column contains products.",
    "dataset": {
      "name": "IBM Box dataset",
      "url": "https://ibm.ent.box.com/v/ReactionSeq2SeqDataset"
    },
    "links": [
      {
        "label": "Paper (arXiv)",
        "url": "https://arxiv.org/abs/1711.04810"
      },
      {
        "label": "Dataset (IBM Box)",
        "url": "https://ibm.ent.box.com/v/ReactionSeq2SeqDataset"
      }
    ],
    "tags": [
      "SMILES",
      "Seq2Seq",
      "Reaction Prediction"
    ]
  },
  {
    "id": 13,
    "code": "MAT-05",
    "title": "Synthetic Chemical Reaction Dynamics via Neural ODEs",
    "category": "Materials & Chemistry",
    "difficulty": "hard",
    "shortDescription": "Predict the mass of each component over time in a synthetic A + B → C + D reaction, tested on reconstruction, extrapolation and completion.",
    "fullDescription": "Featured at \"Prior knowledge meets Neural ODEs: a two-stage training method for improved explainability\" a Tiny Paper @ ICLR 2023. The chemical reaction dataset is a synthetic reaction with four chemical components defined by A + B → C + D. At the first time step there is 1g of A and 1g of B. The goal is to predict the mass of each component over time.",
    "objectives": [
      "Reconstruction: evaluate the performance at predicting the same time steps used for training;",
      "Extrapolation: evaluate the performance at predicting for a longer time horizon than the one used for training;",
      "Completion: evaluate the performance at predicting time steps in between the ones used for training.",
      "Note that the law of the conservation of mass is being followed."
    ],
    "dataset": {
      "name": "Kaggle dataset",
      "url": "https://www.kaggle.com/datasets/cici118/synthetic-chemical-reaction"
    },
    "links": [
      {
        "label": "Paper (OpenReview)",
        "url": "https://openreview.net/pdf?id=p7sHcNt_tqo"
      },
      {
        "label": "Dataset (Kaggle)",
        "url": "https://www.kaggle.com/datasets/cici118/synthetic-chemical-reaction"
      }
    ],
    "tags": [
      "Neural ODEs",
      "Time Series",
      "Scientific ML"
    ]
  },
  {
    "id": 14,
    "code": "MAT-06",
    "title": "Classifying Organic Reaction Mechanisms",
    "category": "Materials & Chemistry",
    "difficulty": "hard",
    "shortDescription": "Develop a robust framework for mechanistic analysis of catalytic organic reactions.",
    "fullDescription": "Develop a robust framework for mechanistic analysis of catalytic organic reactions. Create a deep neural network model capable of analyzing kinetic data to automatically classify reaction mechanisms without user input, reducing human error and overcoming the restrictions of small-step or steady-state reaction networks. Provide an AI-guided tool that streamlines mechanistic elucidation and contributes to the development of automated organic reaction discovery and greener, more sustainable chemical processes.",
    "dataset": {
      "name": "figshare dataset (University of Manchester)",
      "url": "https://figshare.manchester.ac.uk/articles/dataset/Training_validation_and_test_set_for_M1-M20/16965292"
    },
    "links": [
      {
        "label": "Dataset (figshare)",
        "url": "https://figshare.manchester.ac.uk/articles/dataset/Training_validation_and_test_set_for_M1-M20/16965292"
      }
    ],
    "tags": [
      "Deep Learning",
      "Kinetics",
      "Reaction Mechanisms"
    ]
  },
  {
    "id": 15,
    "code": "MAT-07",
    "title": "Meta-Learning for Selectivity Prediction in Asymmetric Catalysis",
    "category": "Materials & Chemistry",
    "difficulty": "hard",
    "shortDescription": "Develop a meta-learning model that can predict the selectivity of new reactions based on limited data.",
    "fullDescription": "The dataset comprises reaction data from asymmetric catalysis experiments, focusing on enantioselectivity outcomes. It includes features such as molecular descriptors, reaction conditions, and catalyst information, with labels indicating the observed selectivity (e.g., enantiomeric excess).",
    "objectives": [
      "Develop a meta-learning model that can predict the selectivity of new reactions based on limited data.",
      "Utilize techniques like prototypical networks to learn shared reaction features across different tasks.",
      "Benchmark the model's performance against traditional machine learning methods, such as random forests and graph neural networks."
    ],
    "outcome": [
      "A web-based tool where users can input reaction conditions and receive predicted selectivity outcomes.",
      "Visualizations to interpret model predictions, such as feature importance and reaction similarity.",
      "Option to upload new reaction data for prediction and analysis."
    ],
    "dataset": {
      "name": "GitHub repository",
      "url": "https://github.com/sukriti243/Meta-learning-for-selectivity-prediction"
    },
    "links": [
      {
        "label": "Dataset / code (GitHub)",
        "url": "https://github.com/sukriti243/Meta-learning-for-selectivity-prediction"
      }
    ],
    "tags": [
      "Meta-Learning",
      "Catalysis",
      "Prototypical Networks"
    ]
  }
];

export function getProblemById(id) {
  return problems.find(p => p.id === Number(id));
}

export function getProblemsByDifficulty(difficulty) {
  if (!difficulty || difficulty === "all") {
    // Keep easy -> medium -> hard order; stable sort preserves order within a tier.
    const rank = { easy: 0, medium: 1, hard: 2 };
    return [...problems].sort((a, b) => (rank[a.difficulty] ?? 3) - (rank[b.difficulty] ?? 3));
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
