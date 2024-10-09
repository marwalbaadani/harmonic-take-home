import axios from 'axios';


export interface ICompany {
    id: number;
    company_name: string;
    liked: boolean;
}

export interface ICollection {
    id: string;
    collection_name: string;
    companies: ICompany[];
    total: number;
}

export interface ICompanyBatchResponse {
    companies: ICompany[];
}

const BASE_URL = 'http://localhost:8000';

export async function getCompanies(offset?: number, limit?: number): Promise<ICompanyBatchResponse> {
    try {
        const response = await axios.get(`${BASE_URL}/companies`, {
            params: {
                offset,
                limit,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
}

export async function getCollectionsById(id: string, offset?: number, limit?: number): Promise<ICollection> {
    try {
        const response = await axios.get(`${BASE_URL}/collections/${id}`, {
            params: {
                offset,
                limit,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
}

export async function getCollectionsMetadata(): Promise<ICollection[]> {
    try {
        const response = await axios.get(`${BASE_URL}/collections`);
        return response.data;
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
}

export async function addCompaniesToCollection(companyIds: string[], collectionId: string, allTag: boolean, currentCollection: string, setLoading: (loading: boolean) => void, setCopyRequestFulfilled: (copyRequestFulfilled: boolean) => void ): Promise<Boolean> {
    console.log("beginning to load...");
    setCopyRequestFulfilled(false);
    console.log("collectionid", collectionId);
    console.log("currentcollection", currentCollection);


    setLoading(true);
    const start = new Date().getTime();
    try {
        const response = await axios.post(`${BASE_URL}/associations/addMultipleAssociations`,
            {
                companyIds: companyIds,
                collectionId: collectionId,
                allTag: allTag,
                currentCollection: currentCollection
            }
        );
        const end = new Date().getTime();
        const time = end - start;
        console.log('Execution time: ' + time);
        setLoading(false);
        setCopyRequestFulfilled(true);
        return response.data;
    } catch (error) {
        console.error('Error fetching companies:', error);
        setLoading(false);
        throw error;
    }

}