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
  existingImages = []
}: { 
  onChangeFiles?: (files: File[]) => void;
  onImagesChange?: (images: Array<{ url: string; public_id: string }>) => void;
  existingImages?: Array<{ url: string; public_id?: string }>;
}) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [modalImg, setModalImg] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [cloudinaryError, setCloudinaryError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent))
  }, [])

  // Cargar imágenes existentes al inicializar
  useEffect(() => {
    if (existingImages.length > 0) {
      const existingImageItems: ImageItem[] = existingImages.map((img, index) => ({
        id: `existing-${index}`,
        url: img.url,
        public_id: img.public_id || `existing-${index}`,
        preview: img.url,
        isUploading: false
      }))
      setImages(existingImageItems)
    }
  }, [existingImages])

  // Función para notificar al componente padre sobre las imágenes subidas
  const notifyParent = useCallback((currentImages: ImageItem[]) => {
    const uploadedImages = currentImages
      .filter(img => img.url && img.public_id && !img.isUploading && !img.error)
      .map(img => ({ url: img.url!, public_id: img.public_id! }))
    onImagesChange?.(uploadedImages)
  }, [onImagesChange])

  // Notificar al padre cuando cambien las imágenes
  useEffect(() => {
    const uploadedImages = images
      .filter(img => img.url && img.public_id && !img.isUploading && !img.error)
      .map(img => ({ url: img.url!, public_id: img.public_id! }))
    onImagesChange?.(uploadedImages)
  }, [images, onImagesChange])

  const uploadToCloudinary = async (file: File): Promise<{ url: string; public_id: string }> => {
    try {
      console.log('Intentando subir a Cloudinary:', file.name)
      const result = await cloudinaryService.uploadImage(file)
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
      setImages(prev => [...prev, tempItem])
      
      // Intentar subir a Cloudinary en segundo plano
      try {
        setImages(prev => prev.map(img => 
          img.id === tempId 
            ? { ...img, isUploading: true }
            : img
        ))
        
        const { url, public_id } = await uploadToCloudinary(file)
        
        setImages(prev => prev.map(img => 
          img.id === tempId 
            ? { ...img, url, public_id, isUploading: false }
            : img
        ))
        
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
  }

  const removeImage = async (id: string) => {
    const imageToRemove = images.find(img => img.id === id)
    
    if (imageToRemove?.public_id) {
      try {
        await cloudinaryService.deleteImage(imageToRemove.public_id)
        console.log('Imagen eliminada de Cloudinary:', imageToRemove.public_id)
      } catch (error) {
        console.error('Error eliminando imagen de Cloudinary:', error)
      }
    }
    
    setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <>
      {cloudinaryError && (
        <Alert color="warning" className="mb-3">
          <strong>Advertencia:</strong> {cloudinaryError}
          <br />
          <small>Las imágenes se mostrarán localmente pero no se guardarán en la nube.</small>
        </Alert>
      )}

      {!isMobile && (
        <div
          {...getRootProps()}
          className="border border-dashed rounded p-4 text-center"
          style={{ minHeight: 120, cursor: 'pointer' }}
        >
          <input {...getInputProps()} />
          <p className="text-muted mb-0">Arrastra imágenes aquí</p>
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 gap-sm-3 my-3">
        <Button color="secondary" onClick={() => fileInputRef.current?.click()} className="w-100 w-sm-auto">
          <FaFolderOpen className="me-1" /> Elegir archivos
        </Button>
        {isMobile && (
          <Button color="secondary" onClick={() => cameraInputRef.current?.click()} className="w-100 w-sm-auto">
            <FaCamera className="me-1" /> Cámara
          </Button>
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

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="images" direction="horizontal">
          {provided => (
            <div
              className="d-flex overflow-auto"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {images.map((img, idx) => (
                <Draggable key={img.id} draggableId={img.id} index={idx}>
                  {prov => (
                    <div
                      className="position-relative me-2"
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      style={{
                        width: 80,
                        height: 80,
                        minWidth: 80,
                        minHeight: 80,
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        overflow: 'hidden',
                        ...prov.draggableProps.style
                      }}
                    >
                      <Badge
                        color={img.error ? "danger" : img.url ? "success" : "primary"}
                        className="position-absolute top-0 start-0 m-1"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {idx + 1}
                      </Badge>
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
                        <div className="position-absolute bottom-0 start-0 end-0 bg-danger text-white text-center" style={{ fontSize: '10px', padding: '2px' }}>
                          Error
                        </div>
                      )}
                      <Button
                        color="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-1 p-1"
                        onClick={() => removeImage(img.id)}
                        style={{ width: '20px', height: '20px', padding: '2px' }}
                      >
                        <FaTrash size={10} />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Modal isOpen={!!modalImg} toggle={() => setModalImg(null)} size="lg">
        <ModalHeader toggle={() => setModalImg(null)}>
          Vista previa
        </ModalHeader>
        <ModalBody className="text-center p-0">
          {modalImg && (
            <img
              src={modalImg}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
          )}
        </ModalBody>
      </Modal>
    </>
  )
}
