/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export const Effects = () => {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      {/* @ts-ignore */}
      <Bloom 
        luminanceThreshold={0.75} 
        mipmapBlur 
        intensity={1.0} 
        radius={0.6}
        levels={8}
      />
      {/* @ts-ignore */}
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      {/* @ts-ignore */}
      <Vignette eskil={false} offset={0.1} darkness={0.5} />
    </EffectComposer>
  );
};
