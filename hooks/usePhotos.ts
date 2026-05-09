import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function usePhotos() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library is required');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    return result.canceled ? null : result.assets[0];
  }, []);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access camera is required');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    return result.canceled ? null : result.assets[0];
  }, []);

  const uploadPhoto = useCallback(async (
    uri: string,
    options?: {
      projectId?: string;
      taskId?: string;
      incidentId?: string;
      inspectionId?: string;
      caption?: string;
      category?: string;
    }
  ) => {
    if (!user) throw new Error('Not authenticated');

    setUploading(true);
    try {
      const filename = uri.split('/').pop() || `${Date.now()}.jpg`;
      const filePath = `${user.id}/${Date.now()}-${filename}`;

      // Read file as base64
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('buildtrack-photos')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('buildtrack-photos')
        .getPublicUrl(filePath);

      // Save photo record to database
      const { data: photo, error: dbError } = await supabase
        .from('photos')
        .insert({
          project_id: options?.projectId,
          task_id: options?.taskId,
          incident_id: options?.incidentId,
          inspection_id: options?.inspectionId,
          url: publicUrl,
          caption: options?.caption,
          category: options?.category || 'general',
          user_id: user.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return photo;
    } finally {
      setUploading(false);
    }
  }, [user]);

  const deletePhoto = useCallback(async (id: string, url: string) => {
    if (!user) throw new Error('Not authenticated');

    // Delete from storage
    const path = url.split('/').pop();
    if (path) {
      await supabase.storage.from('buildtrack-photos').remove([`${user.id}/${path}`]);
    }

    // Delete from database
    const { error } = await supabase.from('photos').delete().eq('id', id);
    if (error) throw error;
  }, [user]);

  return {
    pickImage,
    takePhoto,
    uploadPhoto,
    deletePhoto,
    uploading,
  };
}
