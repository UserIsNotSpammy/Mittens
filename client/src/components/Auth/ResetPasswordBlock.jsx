import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ResetPassword from '../../pages/auth/ResetPassword'

const ResetPasswordBlock = ({onSubmit, block, err, id, children}) => {
    
    let classname = "reset-block"
    if(block< id){
        classname = "reset-block slide-right"
    }
    if(block>id){
         classname = "reset-block slide-left"
    }
 
  return (
    <>
 
    <div className={classname}>
        <div className='logo-container'>
            <figure className='logo'></figure>
        </div>
        <form action="" className='resetPassword' onSubmit={onSubmit}>
                    {children}

            {id== 4?"":<span >{err.status===false? `* ${err.message}` :""}</span>}
            {id== 4?"":<input type="submit" className='form-btn' value={"Next"} />}
            {id== 4?"": <Link to={"/login"} >Oh... I actually remembered :) </ Link>}
        </form>
        
       
    </div>

</>
  )
}

export default ResetPasswordBlock