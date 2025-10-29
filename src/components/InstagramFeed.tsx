'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: InstagramPost | null;
}

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption: string;
  media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  thumbnail_url?: string;
  video_url?: string;
}

const InstagramFeed = () => {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (post: InstagramPost, e: React.MouseEvent) => {
    // Prevent the default button behavior
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedPost(post);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
    
    // Auto-play the video after a short delay to ensure the modal is fully rendered
    if (post.media_type === 'VIDEO') {
      setTimeout(() => {
        const video = document.querySelector('.modal-video') as HTMLVideoElement;
        if (video) {
          video.play().catch(error => {
            console.error('Video play failed:', error);
          });
        }
      }, 100);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };
  // Static Instagram posts data
  const posts: InstagramPost[] = [
    {
      id: 'coffee_brewing',
      media_url: '/images/instagram/coffee_brewing_thumb.jpg',
      video_url: '/videos/instagram/coffee_brewing.mp4',
      permalink: 'https://www.instagram.com/p/coffee_brewing/',
      media_type: 'VIDEO',
      caption: 'Özel kahve demleme sürecimiz',
      thumbnail_url: '/images/instagram/coffee_brewing_thumb.jpg'
    },
    {
      id: 'coffee_art',
      media_url: '/images/instagram/coffee_art_thumb.jpg',
      video_url: '/videos/instagram/coffee_art.mp4',
      permalink: 'https://www.instagram.com/p/coffee_art/',
      media_type: 'VIDEO',
      caption: 'Usta baristalarımızdan kahve sanatı',
      thumbnail_url: '/images/instagram/coffee_art_thumb.jpg'
    },
    {
      id: '2',
      media_url: '/images/instagram/post2.jpg',
      permalink: 'https://www.instagram.com/p/example2',
      caption: 'Yeni Ürünlerimiz'
    },
    {
      id: '3',
      media_url: '/images/instagram/post3.jpg',
      permalink: 'https://www.instagram.com/p/example3',
      caption: 'Kahve Keyfi'
    },
    {
      id: '4',
      media_url: '/images/instagram/post4.jpg',
      permalink: 'https://www.instagram.com/p/example4',
      caption: 'Lezzetli Atıştırmalıklar'
    },
    {
      id: '5',
      media_url: '/images/instagram/post5.jpg',
      permalink: 'https://www.instagram.com/p/example5',
      caption: 'Özel Karışımlarımız'
    },
    {
      id: '6',
      media_url: '/images/instagram/post6.jpg',
      permalink: 'https://www.instagram.com/p/example6',
      caption: 'Mekanımız'
    },
    {
      id: '7',
      media_url: '/images/instagram/post7.jpg',
      permalink: 'https://www.instagram.com/p/example7',
      caption: 'Kahve Çeşitlerimiz'
    },
    {
      id: '8',
      media_url: '/images/instagram/post8.jpg',
      permalink: 'https://www.instagram.com/p/example8',
      caption: 'Tatlı Lezzetler'
    }
  ];
  
  const loading = false;
  const error = null;

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
            Instagram'da Biz
          </h2>
          <div className="flex justify-center">
            <div className="animate-pulse">Yükleniyor...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
            Instagram'da Biz
          </h2>
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50 relative">
      {/* Modal */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button 
                onClick={closeModal}
                className="absolute -right-2 -top-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
                aria-label="Kapat"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative w-full max-w-full mx-auto bg-black">
                <div className="relative" style={{ paddingBottom: '100%' }}>
                  {selectedPost.media_type === 'VIDEO' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <video 
                        src={selectedPost.video_url || selectedPost.media_url}
                        autoPlay
                        playsInline
                        loop
                        className="absolute inset-0 w-full h-full object-contain"
                        poster={selectedPost.thumbnail_url}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300">
                        <button 
                          className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            const video = e.currentTarget.parentElement?.previousElementSibling as HTMLVideoElement;
                            if (video.paused) video.play();
                            else video.pause();
                          }}
                          aria-label="Oynat/Duraklat"
                        >
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.89a1.5 1.5 0 000-2.54L6.3 2.84z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={selectedPost.media_url}
                      alt={selectedPost.caption || 'Instagram gönderisi'}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
              {selectedPost.caption && (
                <div className="p-4">
                  <p className="text-gray-700">{selectedPost.caption}</p>
                </div>
              )}
              <div className="p-4 border-t border-gray-100">
                <a 
                  href={selectedPost.permalink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-starbucks-green hover:underline flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Instagram'da Görüntüle
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
          Instagram'da Biz
        </h2>
        
        <div className="flex justify-center mb-8">
          <a 
            href="https://www.instagram.com/noccacoffee/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-starbucks-green hover:underline flex items-center"
          >
            @noccacoffee
            <svg 
              className="w-5 h-5 ml-2" 
              fill="currentColor" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="w-full block group relative overflow-hidden rounded-lg aspect-square focus:outline-none focus:ring-2 focus:ring-starbucks-green focus:ring-opacity-50"
            >
              <div className="relative w-full h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src={post.thumbnail_url || post.media_url}
                      alt={post.caption || 'Instagram gönderisi'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z" />
                        </svg>
                      </div>
                    </div>
                    {post.media_type === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button 
                          className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform"
                          onClick={(e) => openModal(post, e)}
                          aria-label="Videoyu oynat"
                        >
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.89a1.5 1.5 0 000-2.54L6.3 2.84z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={post.media_url}
                      alt={post.caption || 'Instagram gönderisi'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://www.instagram.com/noccacoffee/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-starbucks-green hover:bg-starbucks-dark-green transition-colors duration-300"
          >
            Tümünü Gör
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
