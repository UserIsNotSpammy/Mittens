import { createPortal } from 'react-dom';
import React, { useRef, useState, useContext, useEffect } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ProfileDataContext } from '../contexts/ProfileDataContext';
import { handleRequest } from '../../utils/helperFunctions';

const EditCatScentWindow = ({ onClose }) => {
  const { fetchedUserData, setFetchedUserData } = useContext(ProfileDataContext);
  const validationSchema = yup.object().shape({
    bio: yup.string().trim().strict(true).required('Catscent is required').max(70, 'Catscent must be at least 10 characters long').min(10),
  });

  const intervalRef = useRef(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    trigger,
    setValue,
    watch,
  } = useForm({ resolver: yupResolver(validationSchema), mode: 'onChange' });
  const bioData = useRef({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (fetchedUserData) {
      setValue('bio', fetchedUserData.generalInfo.bio);
    }
  }, [fetchedUserData, setValue]);

  const bioValue = watch('bio', '');

  async function handleSave(data) {
    bioData.current = {
      bio: data.bio,
    };

    let isValid = await trigger();
    if (isValid) {
      await handleRequest(
        new Request('/api/users/bio/update', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bioData.current),
        }),
        intervalRef,
        setIsLoading,
        (data) => {
          // Update the bio in the context
          setFetchedUserData((prev) => ({
            ...prev,
            generalInfo: {
              ...prev.generalInfo,
              bio: bioData.current.bio,
            },
          }));
          onClose();
        },
        (err) => {
          setError('bio', { type: 'manual', message: 'Error updating bio' });
        }
      );
    }
  }

  return createPortal(
    <div className="window-outer-container">
      <div className="side-block window edit-cat-scent-window" style={{ height: 'fit-content' }}>
        <h1 className="window-header">
          Edit <span>Catscent</span>
        </h1>

        <div className="edit-info-form">
          <div className="input-field">
            <label>Catscent {errors.bio && <span>{`*${errors.bio.message}*`}</span>}</label>
            <textarea autoComplete="off" name="bio" {...register('bio')} className={errors.bio ? 'err' : ''} maxLength={70} style={{ fontSize: '14px' }} />
            <div className="char-counter" style={{ color: 'var(--text-color-glowing)', textAlign: 'right', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-color-glowing)' }}>{bioValue.length}</span>/70
            </div>
          </div>
        </div>

        <div className="sure-buttons-container" style={{ marginTop: '1rem', pointerEvents: isLoading ? 'none' : 'all', opacity: isLoading ? '0.4' : '1' }}>
          <button
            style={{ fontSize: '14px' }}
            className="generic-button danger-button"
            onClick={() => {
              onClose();
            }}>
            Cancel
          </button>
          <button style={{ fontSize: '14px' }} className="generic-button" onClick={handleSubmit(handleSave)}>
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditCatScentWindow;
