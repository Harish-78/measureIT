import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Share,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppTheme, ThemeMode } from '@/hooks/use-theme';
import {
  LandUnit,
  LAND_UNITS,
  UNIT_ORDER,
  convertLandArea,
  formatUnitValue,
  parseInputValue,
} from '@/constants/conversions';

export default function HomeScreen() {
  const { themeMode, setThemeMode, isDark, colors } = useAppTheme();
  const theme = colors;

  // State
  const [inputVal, setInputVal] = useState('1');
  const [inputUnit, setInputUnit] = useState<LandUnit>('acre');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Styling helpers
  const accentColor = isDark ? '#34D399' : '#059669'; // Emerald Green
  const cardBorderColor = isDark ? '#2E3135' : '#E0E1E6';
  const accentBackground = isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(5, 150, 105, 0.08)';

  // Calculate conversions
  const parsedValue = parseInputValue(inputVal);
  const conversions = convertLandArea(parsedValue, inputUnit);

  // Show temporary toast message
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  // Actions
  const handleCopyValue = async (value: number, unit: LandUnit) => {
    const formatted = formatUnitValue(value, unit);
    const unitLabel = LAND_UNITS[unit].label;
    await Clipboard.setStringAsync(`${formatted} ${LAND_UNITS[unit].symbol}`);
    showToast(`Copied ${formatted} ${unitLabel}`);
  };

  const handleCopyAll = async () => {
    const lines = [
      'Land Measurement Conversion',
      '--------------------------------',
      `Acre: ${formatUnitValue(conversions.acre, 'acre')} ac`,
      `Cent: ${formatUnitValue(conversions.cent, 'cent')} ct`,
      `Hectare: ${formatUnitValue(conversions.hectare, 'hectare')} ha`,
      `Sq. Ft.: ${formatUnitValue(conversions.sqft, 'sqft')} sq ft`,
      '--------------------------------',
      'Generated via MeasureIt App',
    ];
    const text = lines.join('\n');
    await Clipboard.setStringAsync(text);
    showToast('Copied all conversions!');
  };

  const handleShare = async () => {
    const lines = [
      'Land Measurement Conversion',
      '--------------------------------',
      `Acre: ${formatUnitValue(conversions.acre, 'acre')} ac`,
      `Cent: ${formatUnitValue(conversions.cent, 'cent')} ct`,
      `Hectare: ${formatUnitValue(conversions.hectare, 'hectare')} ha`,
      `Sq. Ft.: ${formatUnitValue(conversions.sqft, 'sqft')} sq ft`,
      '--------------------------------',
      'Generated via MeasureIt App',
    ];
    const text = lines.join('\n');
    
    try {
      await Share.share({
        message: text,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  // Preset loading trigger
  const handleApplyPreset = (value: number, unit: LandUnit) => {
    setInputUnit(unit);
    setInputVal(value.toString());
    showToast(`Preset loaded: ${value} ${LAND_UNITS[unit].label}`);
  };

  // Theme cycling handler
  const cycleTheme = () => {
    let nextMode: ThemeMode = 'system';
    if (themeMode === 'system') nextMode = 'light';
    else if (themeMode === 'light') nextMode = 'dark';
    else if (themeMode === 'dark') nextMode = 'system';
    setThemeMode(nextMode);
    showToast(`Theme: ${nextMode.toUpperCase()}`);
  };

  // Icon symbol names mapping (using SF Symbols on iOS, Material icons on Android/Web)
  const unitSymbols: Record<LandUnit, any> = {
    acre: { ios: 'square.grid.2x2.fill', android: 'grid_on', web: 'grid_on' },
    cent: { ios: 'dot.circle.fill', android: 'radio_button_checked', web: 'radio_button_checked' },
    hectare: { ios: 'leaf.fill', android: 'eco', web: 'eco' },
    sqft: { ios: 'ruler.fill', android: 'square_foot', web: 'square_foot' },
  };

  const themeSymbols: Record<ThemeMode, any> = {
    light: { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' },
    dark: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' },
    system: { ios: 'sun.and.horizon', android: 'brightness_medium', web: 'brightness_medium' },
  };

  const copySymbol: any = { ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' };
  const copyAllSymbol: any = { ios: 'doc.on.doc.fill', android: 'content_copy', web: 'content_copy' };
  const shareSymbol: any = { ios: 'square.and.arrow.up', android: 'share', web: 'share' };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            {/* Theme Toggle Button on Top Left */}
            <TouchableOpacity
              style={[styles.themeIconButton, { borderColor: cardBorderColor }]}
              onPress={cycleTheme}
            >
              <SymbolView
                name={themeSymbols[themeMode]}
                size={20}
                tintColor={accentColor}
              />
            </TouchableOpacity>

            <ThemedText type="subtitle" style={styles.headerTitle}>
              MeasureIt
            </ThemedText>
            
            {/* Empty block to balance the centered title */}
            <View style={styles.headerSpacer} />
          </View>

          {/* Toast Notification */}
          {toastMessage && (
            <View style={[styles.toast, { backgroundColor: accentColor }]}>
              <ThemedText style={styles.toastText}>{toastMessage}</ThemedText>
            </View>
          )}

          {/* Calculator Input Panel */}
          <ThemedView type="backgroundElement" style={styles.inputCard}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.inputLabel}>
              Value to Convert
            </ThemedText>
            
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.text,
                    borderColor: cardBorderColor,
                    backgroundColor: isDark ? '#1C1D20' : '#FFFFFF',
                  },
                ]}
                keyboardType="numeric"
                value={inputVal}
                onChangeText={setInputVal}
                placeholder="0.00"
                placeholderTextColor={isDark ? '#60646C' : '#9E9E9E'}
                selectTextOnFocus
              />
              
              {/* Horizontal Unit Selector Tabs inside Input Card */}
              <View style={styles.unitSelectorContainer}>
                {UNIT_ORDER.map((unit) => {
                  const isActive = inputUnit === unit;
                  return (
                    <TouchableOpacity
                      key={unit}
                      onPress={() => {
                        setInputUnit(unit);
                        showToast(`Input unit set to ${LAND_UNITS[unit].label}`);
                      }}
                      style={[
                        styles.unitTab,
                        isActive && {
                          backgroundColor: accentColor,
                        },
                        !isActive && {
                          backgroundColor: isDark ? '#2E3135' : '#E0E1E6',
                        },
                      ]}
                    >
                      <ThemedText
                        type="smallBold"
                        style={[
                          styles.unitTabText,
                          { color: isActive ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {LAND_UNITS[unit].symbol.toUpperCase()}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ThemedView>

          {/* Grid of Results */}
          <View style={styles.gridContainer}>
            {UNIT_ORDER.map((unit) => {
              const isSelected = inputUnit === unit;
              const convertedValue = conversions[unit];
              const detail = LAND_UNITS[unit];
              
              return (
                <Pressable
                  key={unit}
                  onPress={() => handleApplyPreset(convertedValue, unit)}
                  style={({ pressed }) => [
                    styles.resultCard,
                    {
                      borderColor: isSelected ? accentColor : cardBorderColor,
                      backgroundColor: isSelected 
                        ? accentBackground 
                        : (isDark ? theme.backgroundElement : '#FFFFFF'),
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <SymbolView
                      name={unitSymbols[unit]}
                      size={16}
                      tintColor={isSelected ? accentColor : theme.textSecondary}
                    />
                    <ThemedText type="smallBold" themeColor={isSelected ? 'text' : 'textSecondary'}>
                      {detail.label}
                    </ThemedText>
                    
                    {/* Copy Button in top right */}
                    <TouchableOpacity
                      style={styles.cardCopyBtn}
                      onPress={() => handleCopyValue(convertedValue, unit)}
                    >
                      <SymbolView
                        name={copySymbol}
                        size={12}
                        tintColor={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  <ThemedText
                    style={[
                      styles.cardValue,
                      { color: isSelected ? accentColor : theme.text },
                    ]}
                  >
                    {formatUnitValue(convertedValue, unit)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {/* Global Operations Panel */}
          <View style={styles.operationsRow}>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: accentColor }]}
              onPress={handleCopyAll}
            >
              <View style={styles.btnContentRow}>
                <SymbolView
                  name={copyAllSymbol}
                  size={16}
                  tintColor="#FFFFFF"
                />
                <ThemedText type="smallBold" style={styles.btnTextWhite}>
                  COPY ALL
                </ThemedText>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.secondaryActionBtn,
                { borderColor: accentColor }
              ]}
              onPress={handleShare}
            >
              <View style={styles.btnContentRow}>
                <SymbolView
                  name={shareSymbol}
                  size={16}
                  tintColor={accentColor}
                />
                <ThemedText type="smallBold" style={{ color: accentColor }}>
                  SHARE RESULT
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Padding bottom helper */}
          <View style={{ height: BottomTabInset + Spacing.five }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
  },
  scrollContent: {
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.two,
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    flex: 2,
    textAlign: 'center',
  },
  themeIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  toast: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.four,
    right: Spacing.four,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  inputCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  textInput: {
    flex: 1,
    minWidth: 150,
    height: 48,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 20,
    fontWeight: '600',
  },
  unitSelectorContainer: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unitTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitTabText: {
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginVertical: Spacing.one,
  },
  resultCard: {
    width: '47%',
    flexGrow: 1,
    minWidth: 150,
    borderWidth: 2,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    width: '100%',
    position: 'relative',
  },
  cardCopyBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: Spacing.one,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  operationsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.three,
    marginVertical: Spacing.two,
  },
  primaryActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: Spacing.two,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  btnTextWhite: {
    color: '#FFFFFF',
  },
});
