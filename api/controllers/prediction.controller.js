import ort from 'onnxruntime-node';

const saleModelPath = './best_sale_model.onnx';
const rentModelPath = './best_rent_model.onnx';


// Features order used while training
const features = [
  'Bedrooms', 'Bathrooms', 'Size_Sqft', 'Parking_bin', 'Furnished_bin',
  'Area_Alwal', 'Area_Ameerpet', 'Area_Bowenpally', 'Area_ECIL', 'Area_Gachibowli',
  'Area_Hitech City', 'Area_Kompally', 'Area_Kukatpally', 'Area_Madhapur', 'Area_Sainikpuri'
];

async function runPrediction(modelPath, data) {
  try {
    const session = await ort.InferenceSession.create(modelPath);

    // Prepare input vector with all features
    const input = new Float32Array(features.length);

    // Map numeric/binary features
    const featureMap = {
      'Bedrooms': Number(data.bedrooms) || 0,
      'Bathrooms': Number(data.bathrooms) || 0,
      'Size_Sqft': Number(data.size_sqft || data.size) || 0,
      'Parking_bin': data.parking ? 1 : 0,
      'Furnished_bin': data.furnished ? 1 : 0,
    };
 
const locations = data.location?.split(',').map(l => l.trim().toLowerCase()) || [];

 
features.forEach((feature, i) => {
  if (feature.startsWith('Area_')) {
    const area = feature.substring(5); // "Alwal", "Ameerpet", etc.
    input[i] = locations.includes(area.toLowerCase()) ? 1  : 0;
    //  console.log(input[i]);
  } else {
    input[i] = featureMap[feature] || 0;
    
  }
}); 
    // Build tensor
    const tensor = new ort.Tensor('float32', input, [1, features.length]);
    const feeds = { [session.inputNames[0]]: tensor };

    // Run inference
    const results = await session.run(feeds);
    const prediction = results[session.outputNames[0]].data[0];

    return prediction;
  } catch (error) {
    console.error('❌ Failed to run prediction:', error);
    throw new Error('Prediction failed');
  }
}

export const predictPrice = async (req, res, next) => {
  try {
    console.log('Prediction request received:', req.body);

    // Select model based on type
    const { type } = req.body;
    const modelPath = type === 'sale' ? saleModelPath : rentModelPath;

    console.log('Loading model from:', modelPath);

    // Run model
    const prediction = await runPrediction(modelPath, req.body);

    // console.log('✅ Prediction successful:', prediction);

    res.status(200).json({ success: true, prediction });
  } catch (error) {
    console.error('❌ Prediction failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
