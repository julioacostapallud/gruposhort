import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Propiedad, propiedades } from '@/lib/services/propiedades';

interface PropertiesState {
  properties: Propiedad[];
  filteredProperties: Propiedad[];
  selectedProperty: Propiedad | null;
  loading: boolean;
  error: string | null;
  filters: any;
}

const initialState: PropertiesState = {
  properties: [],
  filteredProperties: [],
  selectedProperty: null,
  loading: false,
  error: null,
  filters: {},
};

// Async thunk para cargar propiedades
export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (_, { rejectWithValue }) => {
    try {
      const data = await propiedades.list();
      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

// Async thunk para obtener una propiedad específica
export const fetchPropertyById = createAsyncThunk(
  'properties/fetchPropertyById',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await propiedades.get(id);
      return data;
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setSelectedProperty: (state, action: PayloadAction<Propiedad | null>) => {
      state.selectedProperty = action.payload;
    },
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    },
    setFilters: (state, action: PayloadAction<any>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProperties
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
        state.filteredProperties = action.payload;
        state.error = null;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchPropertyById
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProperty = action.payload;
        state.error = null;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSelectedProperty, 
  clearSelectedProperty, 
  setFilters, 
  clearFilters, 
  clearError 
} = propertiesSlice.actions;

export default propertiesSlice.reducer; 