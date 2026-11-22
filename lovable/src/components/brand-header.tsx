import {Link} from '@tanstack/react-router';
import {ArrowUpRight, Asterisk, LockKeyhole} from 'lucide-react';
import {Button} from '@/components/ui/button';
export function BrandHeader(){return <header className="brand-header"><Link to="/" className="wordmark" aria-label="CV-ul.ro — acasă"><Asterisk strokeWidth={2.4}/><span>CV-ul<span className="brand-dot">.ro</span></span></Link><span className="header-note">Un pas înainte. În felul tău.</span><Button variant="paper" asChild><Link to="/editor">CV-ul meu <ArrowUpRight/></Link></Button></header>}
export function Footer(){return <footer className="site-footer"><span>© 2026 CV-ul.ro</span><span><LockKeyhole size={13}/> Date fictive. Nicio plată reală.</span><span>Făcut pentru următorul tău pas.</span></footer>}
