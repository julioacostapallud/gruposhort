// lib/services/cloudinary.ts

interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  url: string;
}

interface CloudinaryDeleteResponse {
  result: string;
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    this.uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
    this.apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';
    this.apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || '';
  }

  // Subir una imagen a Cloudinary a través del backend
  async uploadImage(file: File, propiedadId?: number): Promise<{ url: string; public_id: string }> {
    console.log('Subiendo imagen a través del backend:', {
      fileName: file.name,
      fileSize: file.size,
      propiedadId
    });

    const formData = new FormData();
    formData.append('file', file);
    if (propiedadId) {
      formData.append('propiedad_id', String(propiedadId));
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al subir imagen: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Success response:', data);
      
      return {
        url: data.url,
        public_id: data.public_id,
      };
    } catch (error) {
      console.error('Error subiendo imagen a Cloudinary:', error);
      throw error;
    }
  }

  // Eliminar una imagen de Cloudinary a través del backend
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al eliminar imagen: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error eliminando imagen de Cloudinary:', error);
      throw error;
    }
  }

  // Subir múltiples imágenes
  async uploadMultipleImages(files: File[]): Promise<Array<{ url: string; public_id: string }>> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }

  // Eliminar múltiples imágenes
  async deleteMultipleImages(publicIds: string[]): Promise<boolean[]> {
    const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
    return Promise.all(deletePromises);
  }
}

export const cloudinaryService = new CloudinaryService(); 