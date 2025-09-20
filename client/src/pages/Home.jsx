import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation]);
  console.log(offerListings);
  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();

        const listingsWithPredictions = await Promise.all(
          data.map(async (listing) => {
            if (listing.size && listing.address) {
              const predictionRes = await fetch('/api/prediction/predict', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: listing.type,
                  parking: listing.parking ? 1 : 0,
                  furnished: listing.furnished ? 1 : 0,
                  bedrooms: Number(listing.bedrooms),
                  bathrooms: Number(listing.bathrooms),
                  size_sqft: Number(listing.size),
                  location: listing.address,
                }),
              });
              const predictionData = await predictionRes.json();
              if (predictionData.success) {
                return { ...listing, marketPrice: Number(predictionData.prediction).toFixed(2) };
              }
            }
            return listing; // Return original listing if no prediction or error
          })
        );

        setOfferListings(listingsWithPredictions);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();

        const listingsWithPredictions = await Promise.all(
          data.map(async (listing) => {
            if (listing.size && listing.address) {
              const predictionRes = await fetch('/api/prediction/predict', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: listing.type,
                  parking: listing.parking ? 1 : 0,
                  furnished: listing.furnished ? 1 : 0,
                  bedrooms: Number(listing.bedrooms),
                  bathrooms: Number(listing.bathrooms),
                  size_sqft: Number(listing.size),
                  location: listing.address,
                }),
              });
              const predictionData = await predictionRes.json();
              if (predictionData.success) {
                return { ...listing, marketPrice: Number(predictionData.prediction).toFixed(2) };
              }
            }
            return listing; // Return original listing if no prediction or error
          })
        );

        setRentListings(listingsWithPredictions);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();

        const listingsWithPredictions = await Promise.all(
          data.map(async (listing) => {
            if (listing.size && listing.address) {
              const predictionRes = await fetch('/api/prediction/predict', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: listing.type,
                  parking: listing.parking ? 1 : 0,
                  furnished: listing.furnished ? 1 : 0,
                  bedrooms: Number(listing.bedrooms),
                  bathrooms: Number(listing.bathrooms),
                  size_sqft: Number(listing.size),
                  location: listing.address,
                }),
              });
              const predictionData = await predictionRes.json();
              if (predictionData.success) {
                return { ...listing, marketPrice: Number(predictionData.prediction).toFixed(2) };
              }
            }
            return listing; // Return original listing if no prediction or error
          })
        );

        setSaleListings(listingsWithPredictions);
      } catch (error) {
        console.log(error);
      }
    };
    fetchOfferListings();
  }, []);
  return (
    <div>
      {/* top */}
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto'>
        <h1 className='text-slate-700 font-bold text-3xl lg:text-6xl'>
          Find your next <span className='text-blue-800'>perfect</span>
          <br />
          place with ease
        </h1>
        <div className='text-gray-800 text-xs sm:text-sm'>
         Nestify is your trusted destination for finding the perfect place to 
          live.
          <br />
         Explore a wide range of properties tailored to suit your lifestyle and needs.
        </div>
        <Link
          to={'/search'}
          className='text-xs sm:text-sm text-blue-800 font-bold hover:underline'
        >
          Let's get started...
        </Link>
      </div>

      {/* swiper */}
      <Swiper navigation>
        {offerListings &&
          offerListings.length > 0 &&
          offerListings.map((listing) => (
            <SwiperSlide>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
                className='h-[500px]'
                key={listing._id}
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>

      {/* listing results for offer, sale and rent */}

      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
        {offerListings && offerListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent offers</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?offer=true'}>Show more offers</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent places for rent</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=rent'}>Show more places for rent</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div className=''>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent places for sale</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=sale'}>Show more places for sale</Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
