import {describe,it,expect} from 'vitest';
import {EXPORT_PRICE,EXPORT_PAYMENT,languages,labels} from '@/lib/cv-model';
describe('CV prototype rules',()=>{
 it('charges exactly 5 lei on export',()=>expect(EXPORT_PRICE).toBe(5));
 it('uses a single payment, not a subscription',()=>expect(EXPORT_PAYMENT).toBe('one-time'));
 it('offers the six requested document languages',()=>expect(languages).toEqual(['Română','Engleză','Franceză','Italiană','Spaniolă','Germană']));
 it('provides translated document sections for each language',()=>{expect(labels.Engleză.experience).toBe('Work experience');expect(labels.Franceză.education).toBe('Formation');expect(labels.Italiană.skills).toBe('Competenze');expect(labels.Spaniolă.profile).toBe('Perfil');expect(labels.Germană.languages).toBe('Sprachen');expect(labels.Română.contact).toBe('Contact');});
});
