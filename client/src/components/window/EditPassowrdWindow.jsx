import { createPortal } from 'react-dom';
import React, { useState, useRef, useContext } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { handleRequest } from '../../utils/helperFunctions';

const EditPasswordWindow = ({ onClose }) => {
  const validationSchema = yup.object().shape({
    currentPassword: yup.string().required('Current password is required').min(3, 'Password must be at least 6 characters long'),
    newPassword: yup.string().required('New password is required').min(8, 'Password must be at least 6 characters long'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const intervalRef = useRef(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    trigger,
  } = useForm({ resolver: yupResolver(validationSchema), mode: 'onChange' });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave(data) {
    const passwordData = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    let isValid = await trigger();
    if (isValid) {
      await handleRequest(
        new Request('/api/users/password/update', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passwordData),
        }),
        intervalRef,
        setIsLoading,
        (data) => {
          onClose();
        },
        (err) => {
          setError('currentPassword', { type: 'manual', message: 'Incorrect current password' });
        }
      );
    }
  }

  return createPortal(
    <div className="window-outer-container">
      <div className="side-block window" style={{ height: 'fit-content' }}>
        <h1 className="window-header">
          Change <span>Password</span>
        </h1>

        <div className="edit-info-form">
          <div className="input-field">
            <label>Current Password {errors?.currentPassword && <span>{`*${errors?.currentPassword.message}*`}</span>}</label>
            <input autoComplete="off" type="password" name="currentPassword" {...register('currentPassword')} className={errors?.currentPassword ? 'err' : ''} />
          </div>
          <div className="input-field">
            <label>New Password {errors?.newPassword && <span>{`*${errors?.newPassword.message}*`}</span>}</label>
            <input autoComplete="off" type="password" name="newPassword" {...register('newPassword')} className={errors?.newPassword ? 'err' : ''} />
          </div>
          <div className="input-field">
            <label>Confirm New Password {errors?.confirmPassword && <span>{`*${errors?.confirmPassword.message}*`}</span>}</label>
            <input autoComplete="off" type="password" name="confirmPassword" {...register('confirmPassword')} className={errors?.confirmPassword ? 'err' : ''} />
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

export default EditPasswordWindow;
