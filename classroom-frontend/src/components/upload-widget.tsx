import React, { useEffect } from 'react'
import {UploadWidgetValue} from "@/types"
import { UploadCloud } from 'lucide-react';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/constants';


interface UploadWidgetProps {
  value?: UploadWidgetValue | null;
  onChange: (value: UploadWidgetValue | null) => void;
  disabled?: boolean;
}

const UploadWidget = ({value=null,onChange,disabled=false}: UploadWidgetProps) => {

    const widgetRef = React.useRef<CloudinaryWidget | null>(null);
    const onChangeRef = React.useRef(onChange);

    const [preview,setPreview] =React.useState<UploadWidgetValue | null>(value);


    useEffect(()=>{
        setPreview(value);
    },[value]);

    useEffect(()=>{
        onChangeRef.current = onChange;
    },[onChange]);

    useEffect(()=>{
        if(typeof window ==='undefined') return;

        const initilizeWdiget = ()=>{
            if(!window.cloudinary || widgetRef.current) return false;

            widgetRef.current = window.cloudinary.createUploadWidget({
                cloudName:CLOUDINARY_CLOUD_NAME,
                uploadPreset :CLOUDINARY_UPLOAD_PRESET,
                multiple:false,
                folder:'uploads',
                maxFileSize:5000000,
                clientAllowedFormats:['png','jpg','jpeg','webp']
            },(error,result)=>{
                if(!error && result.event === 'success'){
                    const payload : UploadWidgetValue = {
                        url:result.info.secure_url,
                        publicId:result.info.public_id
                    }

                    setPreview(payload);
                    
                     onChangeRef.current?.(payload);
                }
            })
            
            return true;
        }

        if(initilizeWdiget()) return;

        const intervalId = window.setInterval(()=>{
            if(initilizeWdiget()){
                window.clearInterval(intervalId);
            }
        },500);

        return ()=> window.clearInterval(intervalId);
    },[])

    const openWidget = ()=>{
        if(!disabled) widgetRef.current?.open();

        const removeFromCloudinary = async ()=>{}
    }
  return (
    <div className="space-y-2">
        {
            preview ?(
                <div className="upload-preview">
                    <img src={preview.url} alt="uploaded file" />
                </div>
            ): <div className="upload-dropzone" 
            role='button' 
            tabIndex={0} onClick={openWidget}
            onKeyDown={event=>{
                if(event.key==='Enter'){
                    event.preventDefault();
                    openWidget();
                }
            }}
            >
                <div className="upload-prompt">
                    <UploadCloud className='icon'/>
                    <div>
                        <p>click to upload photo</p>
                        <p>PNG,JPG up to 5MB</p>
                    </div>
                </div>
            </div>
        }
    </div>
  )
}

export default UploadWidget