import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    size: 0, // Changed from sqft to size
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const CLOUDINARY_UPLOAD_PRESET = 'profile_images'; // e.g., 'profile_images'
  const CLOUDINARY_CLOUD_NAME = 'dpimsfdy3';

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 6) {
      setUploading(true);
      setImageUploadError(false);
      const uploadPromises = [];

      for (const file of files) {
        uploadPromises.push(storeImageInCloudinary(file));
      }

      try {
        const urls = await Promise.all(uploadPromises);
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...urls],
        }));
        setUploading(false);
      } catch (err) {
        console.error(err);
        setImageUploadError('Image upload failed. Max size: 2MB per image');
        setUploading(false);
      }
    } else {
      setImageUploadError('You can only upload 6 images per listing');
    }
  };

  const storeImageInCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'listings');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();
    if (!data.secure_url) {
      throw new Error('Upload failed');
    }
    return data.secure_url;
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (id === 'sale' || id === 'rent') {
      setFormData({ ...formData, type: id });
    } else if (['parking', 'furnished', 'offer'].includes(id)) {
      setFormData({ ...formData, [id]: checked });
    } else if (['text', 'number', 'textarea'].includes(type)) {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1) {
        return setError('You must upload at least one image');
      }
      if (+formData.regularPrice < +formData.discountPrice) {
        return setError('Discount price must be lower than regular price');
      }

      setLoading(true);
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success === false) {
        setError(data.message);
        return;
      }

      navigate(`/listing/${data._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  
const handlePredict = async () => {
  try {
    // Pick only the required fields for prediction
    if(  !formData.size || !formData.address )
    {
      alert("Enter your Address and Area in Sqft");
      console.log(data.message);
      return;
    }

    const predictionData = {
      type: formData.type, // "sale" or "rent"
      parking: formData.parking ? 1 : 0,
      furnished: formData.furnished ? 1 : 0,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      size_sqft: Number(formData.size), // make sure your model expects "Size_Sqft"
      location: formData.address,       // or a dropdown for Area (Hitech, Alwal, etc.)
    };
     console.log(predictionData);
    const res = await fetch('/api/prediction/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(predictionData), // send only clean data
    });

    const data = await res.json();
    if (data.success === false) {
      console.log(data.message);
      return;
    }

    // Show predicted price
  setPrediction(`Predicted Price: ${Number(data.prediction).toFixed(2)}`);
  } catch (error) {
    console.log(error);
  }
};

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        Create a Listing
      </h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        {/* Left side of the form */}
        <div className='flex flex-col gap-4 flex-1'>
          <input type='text' id='name' maxLength='62' minLength='5' required placeholder='Name' className='border p-3 rounded-lg' onChange={handleChange} value={formData.name} />
          <textarea id='description' required placeholder='Description' className='border p-3 rounded-lg' onChange={handleChange} value={formData.description} />
          <input type='text' id='address' required placeholder='Address' className='border p-3 rounded-lg' onChange={handleChange} value={formData.address} />

          {/* Checkboxes */}
          <div className='flex gap-6 flex-wrap'>
            {['sale', 'rent', 'parking', 'furnished', 'offer'].map((id) => (
              <label key={id} className='flex gap-2'>
                <input type='checkbox' id={id} className='w-5' onChange={handleChange} checked={formData[id] || formData.type === id} />
                <span className='capitalize'>{id}</span>
              </label>
            ))}
          </div>

          {/* Numeric Inputs */}
          <div className='flex flex-wrap gap-6'>
            {[
              { id: 'bedrooms', label: 'Beds' },
              { id: 'bathrooms', label: 'Baths' },
              { id: 'size', label: 'Size (Sqft)' }, // Changed from sqft to size
              { id: 'regularPrice', label: 'Regular price' },
              ...(formData.offer ? [{ id: 'discountPrice', label: 'Discounted price' }] : []),
            ].map(({ id, label }) => (
              <div key={id} className='flex items-center gap-2'>
                <input type='number' id={id} min='0' required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formData[id]} />
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side of the form (Images) */}
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>
            Images:
            <span className='font-normal text-gray-600 ml-2'>
              The first image will be the cover (max 6)
            </span>
          </p>

          <div className='flex gap-4'>
            <input onChange={(e) => setFiles(e.target.files)} className='p-3 border border-gray-300 rounded w-full' type='file' accept='image/*' multiple />
            <button type='button' disabled={uploading} onClick={handleImageSubmit} className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <p className='text-red-700 text-sm'>{imageUploadError && imageUploadError}</p>

          {/* Preview uploaded images */}
          {formData.imageUrls.map((url, index) => (
            <div key={url} className='flex justify-between p-3 border items-center'>
              <img src={url} alt='listing' className='w-20 h-20 object-contain rounded-lg' />
              <button type='button' onClick={() => handleRemoveImage(index)} className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'>Delete</button>
            </div>
          ))}

          <button disabled={loading || uploading} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
            {loading ? 'Creating...' : 'Create Listing'}
          </button>

          {error && <p className='text-red-700 text-sm'>{error}</p>}
          <button type='button' onClick={handlePredict} className='p-3 bg-blue-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
            Predict Price
          </button>
          {prediction && <p className='text-white bg-green-900 text-center py-2 rounded-md  text-md'>${prediction}</p>}
        </div>
      </form>
    </main>
  );
}