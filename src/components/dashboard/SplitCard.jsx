import { Heart, Share2, Users, Clock, MapPin,Loader} from "lucide-react";
import placeholderImage from "../../assets/onboard3.jpg";
const SplitCard = ({ split }) => (
  <div className="bg-[#F3F3F3] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-1.5 border border-gray-100">
    {/* Image Container */}
    <div className="relative">
      <img
        src={split.image}
        alt={split.title}
        loading="lazy"
        className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3"
        onError={(e) => {
          e.target.src = placeholderImage;
        }}
      />

      {/* Badge */}
      <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
        {split.badge}
      </span>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button  className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all"
          aria-label="Add to favorites"
        >
          <Heart size={16} className="text-white hover:text-red-500" />
        </button>
        <button
          className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all"
          aria-label="Share split"
        >
          <Share2 size={16} className="text-white hover:text-green-600" />
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="space-y-1 p-1.5">
      {/* Title and Category */}
      <div className="flex justify-between items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">
          {split.title}
        </h3>
        <span
          className={`${split.bgClass} text-xs px-2 py-1 rounded-full whitespace-nowrap`}
          style={{ color: split.textColor }}
        >
          {split.categoryName}
        </span>
      </div>

      {/* Price */}
      <p className="text-xs">
        <span className="text-[#1F8225] font-bold">{split.price}</span>
        /person
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-600 pt-2">
        <span className="flex items-center gap-1">
          <Users size={12} /> {split.participants}
        </span>
        <span className="flex items-center text-[#E60000] gap-1">
          <Clock size={12} /> {split.timeLeft}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={12} className="text-[#1F8225]" />
          <span className="truncate max-w-[80px]">{split.location}</span>
        </span>
      </div>

      {/* Price and Action */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-green-600 font-semibold">{split.price}</span>
        <button className="px-3 py-1.5 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
          Join Splitz
        </button>
      </div>
    </div>
  </div>
);

export default SplitCard;