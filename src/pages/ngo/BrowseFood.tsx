import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { FoodListing } from '../../types';
import { FoodCard } from '../../components/FoodCard';
import { SearchFilterBar } from '../../components/SearchFilterBar';
import { Pagination } from '../../components/Pagination';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';

export const BrowseFood: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Query state
  const [search, setSearch] = useState<string>('');
  const [foodType, setFoodType] = useState<string>('all');
  const [city, setCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('expiryDate');
  const [order, setOrder] = useState<string>('asc');
  const [page, setPage] = useState<number>(1);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '8',
        sortBy,
        order,
      });

      if (search.trim()) queryParams.set('search', search.trim());
      if (foodType !== 'all') queryParams.set('foodType', foodType);
      if (city !== 'all') queryParams.set('city', city);

      // Default to available food listings for browsing
      queryParams.set('status', 'available');

      const res = await api.get<{ listings: FoodListing[]; pagination: any }>(
        `/food?${queryParams.toString()}`
      );

      if (res.success && res.data) {
        setListings(res.data.listings);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.pages || 1);
      }
    } catch (err) {
      console.error('Failed to browse food listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, foodType, city, sortBy, order]);

  // Handle debounced search submit or enter
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Browse Surplus Food</h1>
        <p className="text-xs text-neutral-500">
          Find and claim excess food prepared by verified restaurants, hotels, and bakeries
        </p>
      </div>

      {/* Filter and Search Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        foodType={foodType}
        onFoodTypeChange={(val) => {
          setFoodType(val);
          setPage(1);
        }}
        city={city}
        onCityChange={(val) => {
          setCity(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
        order={order}
        onOrderChange={(val) => {
          setOrder(val);
          setPage(1);
        }}
      />

      {/* Listings Grid */}
      {loading ? (
        <Loader text="Searching available meals..." />
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <FoodCard key={item._id} listing={item} showActions={true} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={(p) => setPage(p)}
          />
        </>
      ) : (
        <EmptyState
          title="No food listings matched your filters"
          description="Try clearing your search query or food type filter to explore other available meals."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setFoodType('all');
            setCity('all');
          }}
        />
      )}
    </div>
  );
};
