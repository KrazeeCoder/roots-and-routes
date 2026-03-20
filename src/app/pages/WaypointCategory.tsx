import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { MapPin, Phone, Globe, Clock, ArrowLeft, Star, Users, ArrowRight } from 'lucide-react';
import { supabase } from '../../utils/supabase';

interface WaypointResource {
  id: string;
  name: string;
  category: string;
  description: string;
  full_description?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  tags: string[];
  posted_by_name?: string;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'Food Assistance': {
    bg: 'bg-gradient-to-br from-[#A7AE8A]/10 to-[#A7AE8A]/5',
    text: 'text-[#5B473A]',
    border: 'border-[#A7AE8A]/20'
  },
  'Health & Wellness': {
    bg: 'bg-gradient-to-br from-[#B36A4C]/10 to-[#B36A4C]/5',
    text: 'text-[#B36A4C]',
    border: 'border-[#B36A4C]/20'
  },
  'Housing Support': {
    bg: 'bg-gradient-to-br from-[#334233]/10 to-[#334233]/5',
    text: 'text-[#334233]',
    border: 'border-[#334233]/20'
  },
  'Youth Programs': {
    bg: 'bg-gradient-to-br from-[#E7D9C3]/20 to-[#E7D9C3]/10',
    text: 'text-[#5B473A]',
    border: 'border-[#E7D9C3]/30'
  },
  'Job Help': {
    bg: 'bg-gradient-to-br from-[#6F7553]/10 to-[#6F7553]/5',
    text: 'text-[#6F7553]',
    border: 'border-[#6F7553]/20'
  },
  'Community Events': {
    bg: 'bg-gradient-to-br from-[#F6F1E7]/50 to-[#E7D9C3]/30',
    text: 'text-[#5B473A]',
    border: 'border-[#C2B99E]/30'
  }
};

export function WaypointCategory() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const [resources, setResources] = useState<WaypointResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    const fetchResources = async () => {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('category', category)
          .eq('status', 'published')
          .order('name');

        if (error) {
          console.error('Error fetching resources:', error);
        } else {
          setResources(data || []);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [category]);

  const colors = categoryColors[category] || categoryColors['Food Assistance'];

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F1E7] via-[#E7D9C3] to-[#DCD2B8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-['Cormorant_Garamond',serif] text-[#334233] mb-6">
            No category specified
          </h1>
          <Link to="/" className="inline-flex items-center text-[#B36A4C] hover:text-[#8A5543] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F1E7] via-[#E7D9C3] to-[#DCD2B8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-[#B36A4C] mx-auto mb-6"></div>
          <p className="text-[#5B473A] text-xl font-light">Loading {category.toLowerCase()} resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F1E7] via-[#E7D9C3] to-[#DCD2B8]">
      {/* Enhanced Professional Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-md border-b border-[#E7D9C3]/60">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-5">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-[#5B473A] hover:text-[#B36A4C] transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6F7553] font-medium">Essential Waypoints</span>
              <span className="text-[#C2B99E]">/</span>
              <span className={`text-sm font-bold ${colors.text}`}>{category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Hero Section */}
      <div className={`${colors.bg} border-b ${colors.border} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="text-center">
            <h1 className="font-['Cormorant_Garamond',serif] text-5xl font-bold mb-4">
              <span className={colors.text}>{category}</span>
            </h1>
            <p className="text-[#5B473A] text-xl mb-6 max-w-2xl mx-auto font-light leading-relaxed">
              {resources.length} {resources.length === 1 ? 'resource' : 'resources'} available to help you
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-[#6F7553]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Local</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="font-medium">Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">Community</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Resources Grid */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {resources.length === 0 ? (
          <div className="text-center py-20">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${colors.bg} flex items-center justify-center border-2 ${colors.border}`}>
              <MapPin className="w-8 h-8 text-[#6F7553]" />
            </div>
            <h3 className="text-2xl font-['Cormorant_Garamond',serif] text-[#334233] mb-3">
              No resources found
            </h3>
            <p className="text-[#5B473A] text-lg mb-6 max-w-xl mx-auto font-light leading-relaxed">
              We haven't added any resources to this category yet. Check back soon or suggest a resource!
            </p>
            <Link 
              to="/suggest" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#B36A4C] text-white rounded-lg hover:bg-[#8A5543] transition-all transform hover:scale-105 shadow-lg font-semibold"
            >
              Suggest a Resource
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <div 
                key={resource.id}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#E7D9C3]/40 hover:border-[#A7AE8A]/60 overflow-hidden flex flex-col transform hover:-translate-y-1"
              >
                {/* Compact Header */}
                <div className={`p-5 ${colors.bg} border-b ${colors.border}`}>
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold mb-2">
                    <span className={colors.text}>{resource.name}</span>
                  </h3>
                  <p className="text-[#5B473A] text-sm leading-relaxed line-clamp-2 font-light">
                    {resource.description}
                  </p>
                </div>

                {/* Compact Content */}
                <div className="p-5 flex-grow flex flex-col">
                  {/* Contact Info */}
                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                      <span className="text-[#5B473A] leading-relaxed text-sm">{resource.address}</span>
                    </div>
                    
                    {resource.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className={`w-4 h-4 flex-shrink-0 ${colors.text}`} />
                        <a 
                          href={`tel:${resource.phone}`} 
                          className={`${colors.text} hover:underline font-medium text-sm`}
                        >
                          {resource.phone}
                        </a>
                      </div>
                    )}
                    
                    {resource.website && (
                      <div className="flex items-center gap-2">
                        <Globe className={`w-4 h-4 flex-shrink-0 ${colors.text}`} />
                        <a 
                          href={resource.website.startsWith('http') ? resource.website : `https://${resource.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${colors.text} hover:underline font-medium truncate text-sm`}
                        >
                          {resource.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    
                    {resource.hours && (
                      <div className="flex items-start gap-2">
                        <Clock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                        <span className="text-[#5B473A] leading-relaxed text-sm">{resource.hours}</span>
                      </div>
                    )}
                  </div>

                  {/* Compact Tags */}
                  {resource.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className={`px-2.5 py-1 text-xs rounded-full ${colors.bg} ${colors.text} border ${colors.border} font-medium`}
                          >
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="text-xs text-[#6F7553] px-2 py-1 font-medium">
                            +{resource.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Compact Posted by */}
                  {resource.posted_by_name && (
                    <div className="mt-auto pt-3 border-t border-[#E7D9C3]/50">
                      <p className="text-xs text-[#6F753] font-light">
                        Posted by <span className="font-medium text-[#5B473A]">{resource.posted_by_name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Footer CTA */}
      <div className={`${colors.bg} border-t ${colors.border} mt-12`}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10 text-center">
          <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold mb-3">
            Can't find what you need?
          </h3>
          <p className="text-[#5B473A] text-base mb-6 max-w-2xl mx-auto font-light leading-relaxed">
            Help us grow our community resource directory by suggesting organizations that serve the Bothell area.
          </p>
          <Link 
            to="/suggest" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#B36A4C] text-white rounded-lg hover:bg-[#8A5543] transition-all transform hover:scale-105 shadow-lg font-semibold"
          >
            Suggest a Resource
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
