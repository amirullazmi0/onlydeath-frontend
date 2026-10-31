import { useQuery } from '@tanstack/react-query';

/** Same public dataset kratify uses: province -> regency -> district (kecamatan) -> village (kelurahan). */
const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export interface RegionOption {
    id: string;
    name: string;
}

const fetchRegions = async (path: string): Promise<RegionOption[]> => {
    const res = await fetch(`${BASE_URL}/${path}.json`);
    if (!res.ok) throw new Error(`Failed to load regions (${path})`);
    return res.json();
};

const useRegionList = (path: string | null) =>
    useQuery({
        queryKey: ['indonesia-regions', path],
        queryFn: () => fetchRegions(path as string),
        enabled: !!path,
        // Administrative regions practically never change
        staleTime: Infinity,
        gcTime: 24 * 60 * 60 * 1000,
    });

/** Cascading region lists for the selected ids; each level loads once its parent is picked. */
export function useIndonesiaRegions(
    enabled: boolean,
    ids: { provinceId?: string; cityId?: string; districtId?: string },
) {
    const provinces = useRegionList(enabled ? 'provinces' : null);
    const cities = useRegionList(enabled && ids.provinceId ? `regencies/${ids.provinceId}` : null);
    const districts = useRegionList(enabled && ids.cityId ? `districts/${ids.cityId}` : null);
    const villages = useRegionList(enabled && ids.districtId ? `villages/${ids.districtId}` : null);

    return {
        provinces: provinces.data ?? [],
        cities: cities.data ?? [],
        districts: districts.data ?? [],
        villages: villages.data ?? [],
        loading: {
            provinces: provinces.isLoading,
            cities: cities.isLoading,
            districts: districts.isLoading,
            villages: villages.isLoading,
        },
        error: provinces.isError || cities.isError || districts.isError || villages.isError,
    };
}
