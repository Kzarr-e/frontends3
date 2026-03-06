'use client';

import { useState } from 'react';
import './toggle.css'
import WomensBannerCard from './WomensBannerCard';
import MensBannerCard from './MensBannerCard';

const BannerToggle = () => {
    const [selected, setSelected] = useState<'women' | 'men'>('women');

    const btnStyle = (isSelected: boolean) => ({
        width: '170px',
        padding: '12px 0',
        border: '2px solid #EFBF04',
        cursor: 'pointer',
        fontFamily: 'Montserrat',
        backgroundColor: isSelected ? '#EFBF04' : '#ffffff',
        color: isSelected ? '#ffffff' : '#EFBF04',
        fontSize: '18px',
        fontWeight: 600,
        borderRadius: '0px',
        textAlign: 'center' as const,
        transition: 'all 0.3s ease',
    });

    return (
        <div className="banner-toggle-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0px', alignItems: 'center', width: '100%'}}>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0px', marginTop:'0%',}}>
                <button onClick={() => setSelected('women')} style={btnStyle(selected === 'women')}>
                    Women
                </button>
                <button onClick={() => setSelected('men')} style={btnStyle(selected === 'men')}>
                    Men
                </button>
            </div>

            {/* Banner Section */}
            <div>
                {selected === 'women' ? (
                    <div className="banner_sections" >
                    <WomensBannerCard /> 
                    </div>
                ) : (
                    <div className="banner_sections">
                    <MensBannerCard/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BannerToggle;