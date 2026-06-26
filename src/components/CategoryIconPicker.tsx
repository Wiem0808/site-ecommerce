'use client';
import React, { useState } from 'react';
import { CATEGORY_ICONS, CatIconDef } from './CategoryIcons';
import styles from './CategoryIconPicker.module.css';

interface CategoryIconTileProps {
  iconId: string;
  gradient?: string;
  shadowColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

/**
 * Renders a single premium icon tile with glow, float, and shimmer effects.
 */
export function CategoryIconTile({ iconId, gradient, shadowColor, size = 'md', animate = true, className }: CategoryIconTileProps) {
  const def = CATEGORY_ICONS.find(i => i.id === iconId);
  if (!def) return null;
  const bg = gradient || def.gradient;
  const shadow = shadowColor || def.shadowColor;

  return (
    <div
      className={`${styles.tile} ${styles[size]} ${animate ? styles.animated : ''} ${className || ''}`}
      style={{
        backgroundImage: bg,
        boxShadow: `0 8px 32px ${shadow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
      }}
    >
      <div className={styles.shimmer} />
      <div className={styles.iconInner}>{def.icon}</div>
    </div>
  );
}

interface CategoryIconPickerProps {
  selectedId: string;
  selectedGradient: string;
  onSelect: (iconId: string, gradient: string, shadowColor: string) => void;
}

/**
 * Full icon picker grid — shows all premium category icons in a responsive grid.
 */
export function CategoryIconPicker({ selectedId, selectedGradient, onSelect }: CategoryIconPickerProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className={styles.pickerGrid}>
      {CATEGORY_ICONS.map((def: CatIconDef) => {
        const isSelected = selectedId === def.id;
        const isHovered = hovered === def.id;
        return (
          <button
            key={def.id}
            type="button"
            className={`${styles.pickerItem} ${isSelected ? styles.pickerSelected : ''}`}
            onClick={() => onSelect(def.id, def.gradient, def.shadowColor)}
            onMouseEnter={() => setHovered(def.id)}
            onMouseLeave={() => setHovered(null)}
            title={def.label}
          >
            <div
              className={styles.pickerTile}
              style={{
                backgroundImage: def.gradient,
                boxShadow: (isSelected || isHovered)
                  ? `0 6px 20px ${def.shadowColor}`
                  : '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <div className={styles.shimmer} />
              <div className={styles.pickerIconInner}>{def.icon}</div>
            </div>
            {isSelected && <div className={styles.selectedRing} />}
          </button>
        );
      })}
    </div>
  );
}
