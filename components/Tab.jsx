import React, { useState, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import state from '../store'

const Tab = ({tab, isFilterTab, isActiveTab, handleClick}) => {
  const snap = useSnapshot(state)
  const [color, setColor] = useState(snap.themeDark ? 'white' : 'black');

  // This effect handles color change based on the active tab and theme
  useEffect(() => {
    if(snap.activeTab === tab.name){
      setColor('#04E762');
    } else {
      setColor(snap.themeDark ? 'white' : 'black');
    }
  }, [snap.activeTab, snap.themeDark]);

  // This effect handles color change when the theme is toggled (themeDark -> themeLight or vice versa)
  useEffect(() => {
    setColor(snap.themeDark ? 'white' : 'black');
  }, [snap.themeDark]);

  const activeStyles = isFilterTab && isActiveTab ? 
    {backgroundColor: snap.color, opacity: 0.5} : 
    {backgroundColor: 'transparent', opacity: 1}

  const handleClickColorChange = () => {
    handleClick();
    if (state.activeTab === tab.name) {
      setColor(snap.themeDark ? 'white' : 'black');
    } else {
      setColor('#04E762');
    }
  };

  return (
    <div key={tab.name} className={`tab-btn ${isFilterTab ? 'rounded-full' : 'rounded-4'}`} onClick={handleClickColorChange} style={activeStyles}>
      {snap.themeLight && (
        <div style={{color: color}} className='hover:text-[#04E762] transition-color ease-in-out'>{tab.icon}</div>
      )}
      {snap.themeDark && (
        <div style={{color: color}} className='hover:text-[#04E762] transition-color ease-in-out'>{tab.icon}</div>
      )}
    </div>
  )
}

export default Tab