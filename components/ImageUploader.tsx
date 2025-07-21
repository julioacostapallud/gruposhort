'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import {
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Badge,
  Spinner,
  Alert
} from 'reactstrap'
import { FaTrash, FaCamera, FaFolderOpen } from 'react-icons/fa'
import { cloudinaryService } from '@/lib/services/cloudinary'

type ImageItem = {
  id: string
  file?: File
  preview: string
  url?: string
  public_id?: string
  isUploading?: boolean
  error?: string
}

export function ImageUploader({ 
  onChangeFiles, 
  onImagesChange,
  existingImages = [],
  isEditMode = false,
  propiedadId
}: { 
  onChangeFiles?: (files: File[]) => void;
  onImagesChange?: (images: Array<{ url: string; public_id: string }>) => void;
  existingImages?: Array<{ url: string; public_id?: string }>;
  isEditMode?: boolean;
  propiedadId?: number;
}) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<Array<{ url: string; public_id: string }>>([])
  const [modalImg, setModalImg] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [cloudinaryError, setCloudinaryError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent))
  }, [])

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalImg) {
        setModalImg(null)
      }
    }
    
    if (modalImg) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [modalImg])

  // Función para notificar al componente padre sobre las imágenes subidas
  const notifyParent = useCallback((currentImages: ImageItem[]) => {
    const uploadedImages = currentImages
      .filter(img => img.url && !img.isUploading && !img.error)
      .map(img => ({ 
        url: img.url!, 
        public_id: img.public_id || `existing-${img.id}` // Usar public_id real o generar uno para existentes
      }))
    onImagesChange?.(uploadedImages)
  }, [onImagesChange])

  // Cargar imágenes existentes al inicializar
  useEffect(() => {
    if (existingImages.length > 0) {
      const existingImageItems: ImageItem[] = existingImages.map((img, index) => ({
        id: `existing-${index}`,
        url: img.url,
        public_id: img.public_id, // Usa el public_id real
        preview: img.url,
        isUploading: false
      }))
      setImages(existingImageItems)
      // Notificar al padre sobre las imágenes existentes
      notifyParent(existingImageItems)
    } else {
      setImages([])
      // Notificar al padre que no hay imágenes
      onImagesChange?.([])
    }
  }, [JSON.stringify(existingImages), notifyParent, onImagesChange]) // Usar JSON.stringify para comparar el contenido del array

  // Función para obtener las imágenes marcadas para eliminar (para el componente padre)
  const getImagesToDelete = useCallback(() => {
    return imagesToDelete
  }, [imagesToDelete])

  // Función para limpiar las imágenes marcadas para eliminar (después de guardar)
  const clearImagesToDelete = useCallback(() => {
    setImagesToDelete([])
  }, [])

  // Notificar al padre cuando cambien las imágenes - eliminado para evitar bucles infinitos
  // La notificación se hace a través de notifyParent en los lugares apropiados

  const uploadToCloudinary = async (file: File): Promise<{ url: string; public_id: string }> => {
    try {
      console.log('Intentando subir a Cloudinary:', file.name)
      const result = await cloudinaryService.uploadImage(file, propiedadId)
      console.log('Subida exitosa a Cloudinary:', result)
      return result
    } catch (error) {
      console.error('Error subiendo a Cloudinary:', error)
      throw error
    }
  }

  const onFiles = async (files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    console.log('Archivos seleccionados:', fileArray.map(f => f.name))
    
    for (const file of fileArray) {
      const tempId = URL.createObjectURL(file)
      const tempItem: ImageItem = {
        id: tempId,
        file,
        preview: URL.createObjectURL(file),
        isUploading: false // Primero mostramos la imagen local
      }
      
      // Agregar la imagen inmediatamente para mostrar preview
      setImages(prev => {
        const updated = [...prev, tempItem]
        notifyParent(updated)
        return updated
      })
      
      // Intentar subir a Cloudinary en segundo plano
      try {
        setImages(prev => prev.map(img => 
          img.id === tempId 
            ? { ...img, isUploading: true }
            : img
        ))
        
        const { url, public_id } = await uploadToCloudinary(file)
        
        setImages(prev => {
          const updated = prev.map(img => 
            img.id === tempId 
              ? { ...img, url, public_id, isUploading: false }
              : img
          )
          notifyParent(updated)
          return updated
        })
        
        setCloudinaryError(null) // Limpiar errores previos
      } catch (error) {
        console.error('Error subiendo imagen a Cloudinary:', error)
        setCloudinaryError(`Error subiendo ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        
        setImages(prev => prev.map(img => 
          img.id === tempId 
            ? { ...img, isUploading: false, error: 'Error en Cloudinary' }
            : img
        ))
      }
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('Archivos arrastrados:', acceptedFiles.map(f => f.name))
    for (const file of acceptedFiles) {
      const tempId = URL.createObjectURL(file)
      const tempItem: ImageItem = {
        id: tempId,
        file,
        preview: URL.createObjectURL(file),
        isUploading: false
      }
      
      // Agregar la imagen inmediatamente
      setImages(prev => {
        const updated = [...prev, tempItem]
        notifyParent(updated)
        return updated
      })
      
      // Intentar subir a Cloudinary
      try {
        setImages(prev => prev.map(img => 
          img.id === tempId 
            ? { ...img, isUploading: true }
            : img
        ))
        
        const { url, public_id } = await uploadToCloudinary(file)
        
        setImages(prev => {
          const updated = prev.map(img => 
            img.id === tempId 
              ? { ...img, url, public_id, isUploading: false }
              : img
          )
          notifyParent(updated)
          return updated
        })
        
        setCloudinaryError(null)
      } catch (error) {
        console.error('Error subiendo imagen a Cloudinary:', error)
        setCloudinaryError(`Error subiendo ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        
        setImages(prev => prev.map(img => 
          img.id === tempId 
            ? { ...img, isUploading: false, error: 'Error en Cloudinary' }
            : img
        ))
      }
    }
  }, [notifyParent])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    noClick: true,
    noKeyboard: true
  })

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const reordered = Array.from(images)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setImages(reordered)
    // Notificar al componente padre con el nuevo orden
    notifyParent(reordered)
  }

  const removeImage = async (id: string) => {
    const imageToRemove = images.find(img => img.id === id)
    
    if (!imageToRemove) return
    
    if (isEditMode) {
      // En modo edición: solo marcar para eliminar, no eliminar inmediatamente
      if (imageToRemove.public_id && !imageToRemove.public_id.startsWith('existing-')) {
        setImagesToDelete(prev => [...prev, { 
          url: imageToRemove.url || imageToRemove.preview, 
          public_id: imageToRemove.public_id! 
        }])
        console.log('Imagen marcada para eliminar en modo edición:', imageToRemove.public_id)
      }
    } else {
      // En modo alta: eliminar inmediatamente de Cloudinary
      if (imageToRemove.public_id && !imageToRemove.public_id.startsWith('existing-')) {
        try {
          console.log('Eliminando imagen de Cloudinary:', imageToRemove.public_id)
          await cloudinaryService.deleteImage(imageToRemove.public_id)
          console.log('Imagen eliminada exitosamente de Cloudinary:', imageToRemove.public_id)
        } catch (error) {
          console.error('Error eliminando imagen de Cloudinary:', error)
          // Aún así eliminamos del estado local para no bloquear la UI
        }
      }
    }
    
    // Limpiar URL del objeto si existe
    if (imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview)
    }
    
    // Eliminar del estado local y notificar al padre
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      notifyParent(updated)
      return updated
    })
    
    console.log('Imagen eliminada del estado local:', id)
  }

  // Exponer funciones para el componente padre
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).ImageUploaderRef = {
        getImagesToDelete,
        clearImagesToDelete
      }
    }
  }, [getImagesToDelete, clearImagesToDelete])

  return (
    <>
      {cloudinaryError && (
        <Alert color="warning" className="mb-3">
          <strong>Advertencia:</strong> {cloudinaryError}
          <br />
          <small>Las imágenes se mostrarán localmente pero no se guardarán en la nube.</small>
        </Alert>
      )}

      {isEditMode && imagesToDelete.length > 0 && (
        <Alert color="info" className="mb-3">
          <strong>Modo edición:</strong> {imagesToDelete.length} imagen(es) marcada(s) para eliminar. 
          Se eliminarán de Cloudinary solo cuando guardes los cambios.
        </Alert>
      )}

      <div
        className="border border-dashed rounded p-4 text-center"
        style={{ minHeight: 120, cursor: isMobile ? 'default' : 'pointer', position: 'relative' }}
        {...(!isMobile ? getRootProps() : {})}
      >
        {!isMobile && <input {...getInputProps()} />}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  alignItems: 'flex-start',
                  minHeight: 80,
                }}
              >
                {images.length === 0 && (
                  <p className="text-muted mb-0 w-100" style={{ color: '#bbb' }}>
                    {isMobile ? 'Selecciona o toma una foto' : 'Arrastra imágenes aquí'}
                  </p>
                )}
                {images.map((img, idx) => (
                  <Draggable key={img.id} draggableId={img.id} index={idx}>
                    {prov => (
                      <div
                        className="position-relative"
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        style={{
                          position: 'relative',
                          width: 80,
                          height: 80,
                          minWidth: 80,
                          minHeight: 80,
                          border: '1px solid #ddd',
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: '#fff',
                          boxSizing: 'border-box',
                          flex: '0 0 auto',
                          display: 'block',
                          ...prov.draggableProps.style
                        }}
                      >
                        {/* Overlay superior para trash y número */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            left: 0,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            zIndex: 2,
                            pointerEvents: 'none',
                            padding: '0 4px',
                          }}
                        >
                          {/* Número a la izquierda */}
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              background: 'rgba(255,255,255,0.85)',
                              color: '#222',
                              borderRadius: 8,
                              padding: '0 7px',
                              pointerEvents: 'auto',
                            }}
                          >
                            {idx + 1}
                          </span>
                          {/* Trash a la derecha */}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(img.id);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              background: '#dc3545',
                              border: '2px solid #fff',
                              cursor: 'pointer',
                              boxShadow: '0 1px 4px rgba(220,53,69,0.3)',
                              transition: 'background 0.2s',
                              pointerEvents: 'auto',
                            }}
                            title={isEditMode ? "Marcar para eliminar" : "Eliminar imagen"}
                          >
                            <FaTrash size={11} color="white" />
                          </span>
                        </div>
                        {img.isUploading ? (
                          <div className="d-flex align-items-center justify-content-center w-100 h-100 bg-light">
                            <Spinner size="sm" />
                          </div>
                        ) : (
                          <img
                            src={img.url || img.preview}
                            alt=""
                            className="w-100 h-100"
                            style={{ objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setModalImg(img.url || img.preview)}
                          />
                        )}
                        {img.error && (
                          <div className="position-absolute bottom-0 start-0 end-0 bg-danger text-white text-center" style={{ fontSize: '10px', padding: '2px', zIndex: 2 }}>
                            Error
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="flex flex-row flex-nowrap justify-center gap-2 my-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-green-200 text-green-900 font-semibold hover:bg-green-300 transition-colors shadow-sm"
          style={{ minWidth: 160 }}
        >
          <FaFolderOpen className="me-1" /> Elegir archivos
        </button>
        {isMobile && (
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-200 text-blue-900 font-semibold hover:bg-blue-300 transition-colors shadow-sm"
            style={{ minWidth: 160 }}
          >
            <FaCamera className="me-1" /> Cámara
          </button>
        )}
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={e => onFiles(e.target.files)}
      />
      {isMobile && (
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          style={{ display: 'none' }}
          onChange={e => onFiles(e.target.files)}
        />
      )}

      {modalImg && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setModalImg(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              color="light"
              size="sm"
              onClick={() => setModalImg(null)}
              className="p-1 border-0 position-absolute"
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%',
                fontSize: '20px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderColor: '#ffffff',
                color: '#000000',
                position: 'absolute',
                top: '-50px',
                right: '0px',
                zIndex: 10000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              ×
            </Button>
            <img
              src={modalImg}
              alt="Preview"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

