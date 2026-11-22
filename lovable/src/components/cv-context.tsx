import {createContext, useContext, useState, type ReactNode} from 'react';
import {initialCV, type CVData, type Format, type Language} from '@/lib/cv-model';
interface State { cv:CVData; setCV:React.Dispatch<React.SetStateAction<CVData>>; format:Format; setFormat:(v:Format)=>void; language:Language; setLanguage:(v:Language)=>void; step:number; setStep:(v:number)=>void }
const Context=createContext<State|null>(null);
export function CVProvider({children}:{children:ReactNode}) {const [cv,setCV]=useState(initialCV);const [format,setFormat]=useState<Format>('Modern');const [language,setLanguage]=useState<Language>('Română');const [step,setStep]=useState(0);return <Context.Provider value={{cv,setCV,format,setFormat,language,setLanguage,step,setStep}}>{children}</Context.Provider>}
export function useCV(){const state=useContext(Context);if(!state) throw new Error('CVProvider missing');return state;}
