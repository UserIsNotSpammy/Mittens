import { createPortal } from 'react-dom';
import React, { useRef, useState, useContext, useEffect } from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import countries from '../Auth/countries.json';
import { LoginContext } from '../contexts/LoginContext';
import { ProfileDataContext } from '../contexts/ProfileDataContext';
import { handleRequest } from '../../utils/helperFunctions';

const EditGeneralInfoWindow = ({ onClose }) => {
  const { fetchedUserData, setFetchedUserData } = useContext(ProfileDataContext);
  const validationSchema = yup.object().shape({
    firstName: yup
      .string()
      .trim()
      .strict(true)
      .required('First name is required')
      .min(2)
      .max(20)
      .matches(/^[a-zA-Z]+$/, 'Only letters allowed'),

    lastName: yup
      .string()
      .trim()
      .strict(true)
      .required('Last name is required')
      .min(2)
      .max(20)
      .matches(/^[a-zA-Z]+$/, 'Only letters allowed'),

    birthDate: yup
      .date()
      .transform((value, originalValue) => {
        return originalValue ? value : undefined;
      })
      .typeError('Invalid date')
      .required('Date of birth is required'),

    gender: yup.string().trim().strict(true).oneOf(['male', 'female'], 'Invalid gender').required('Gender is required'),

    country: yup
      .string()
      .trim()
      .strict(true)
      .required('Country is required')
      .matches(/^[a-zA-Z\s]+$/, 'Only letters allowed'),

    password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters long'),
  });

  const intervalRef = useRef(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    trigger,
    setValue,
  } = useForm({ resolver: yupResolver(validationSchema), mode: 'onChange' });
  const generalInfoData = useRef({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (fetchedUserData) {
      setValue('firstName', fetchedUserData.firstName);
      setValue('lastName', fetchedUserData.lastName);
      setValue('birthDate', fetchedUserData.generalInfo.dateOfBirth.split('T')[0]);
      setValue('gender', fetchedUserData.generalInfo.gender);
      setValue('country', fetchedUserData.generalInfo.livesIn);
    }
  }, [fetchedUserData, setValue]);

  async function handleSave(data) {
    generalInfoData.current = {
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: new Date(data.birthDate).toISOString(),
      gender: data.gender,
      country: data.country,
      password: data.password,
    };

    let isValid = await trigger();
    if (isValid) {
      await handleRequest(
        new Request('/api/users/generalInfo/update', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(generalInfoData.current),
        }),
        intervalRef,
        setIsLoading,
        (data) => {
          setFetchedUserData((prev) => ({
            ...prev,
            firstName: generalInfoData.current.firstName,
            lastName: generalInfoData.current.lastName,
            generalInfo: {
              ...prev.generalInfo,
              gender: generalInfoData.current.gender,
              dateOfBirth: generalInfoData.current.birthDate,
              livesIn: generalInfoData.current.country,
            },
          }));
          onClose();
        },
        (err) => {
          setError('password', { type: 'manual', message: 'Incorrect password' });
        }
      );
    }
  }

  return createPortal(
    <div className="window-outer-container">
      <div className="side-block window edit-general-info-window">
        <h1 className="window-header">
          <span>General</span> info
        </h1>

        <div className="edit-info-form">
          <div className="input-field">
            <label>First Name {errors.firstName && <span>{`*${errors.firstName.message}*`}</span>}</label>
            <input autoComplete="off" type="text" name="firstName" {...register('firstName')} className={errors.firstName ? 'err' : ''} />
          </div>
          <div className="input-field">
            <label>Last Name {errors.lastName && <span>{`*${errors.lastName.message}*`}</span>}</label>
            <input autoComplete="off" type="text" name="lastName" {...register('lastName')} className={errors.lastName ? 'err' : ''} />
          </div>
          <div className="input-field">
            <label>Date Of Birth {errors.birthDate && <span>{`*${errors.birthDate.message}*`}</span>}</label>
            <input autoComplete="off" type="date" name="birthDate" {...register('birthDate')} className={errors.birthDate ? 'err' : ''} />
          </div>
          <div className="input-field">
            <label>Gender {errors.gender && <span>{`*${errors.gender.message}*`}</span>}</label>
            <select name="gender" {...register('gender')} className={errors.gender ? 'err' : ''}>
              <option value=""> Select Gender </option>
              <option value="male"> Male </option>
              <option value="female"> Female </option>
            </select>
          </div>
          <div className="input-field">
            <label>Country {errors.country && <span>{`*${errors.country.message}*`}</span>}</label>
            <select name="country" {...register('country')} className={errors.country ? 'err' : ''}>
              <option value="">Select country</option>
              {countries.map((country) => {
                return (
                  <option value={country.name} key={country.code}>
                    {country.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="input-field">
            <label>Password {errors.password && <span>{`*${errors.password.message}*`}</span>}</label>
            <input autoComplete="off" type="password" name="password" {...register('password')} className={errors.password ? 'err' : ''} />
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

export default EditGeneralInfoWindow;
