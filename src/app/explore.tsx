import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppTheme, ThemeMode } from '@/hooks/use-theme';
import {
  LandUnit,
  LAND_UNITS,
  UNIT_ORDER,
  formatUnitValue,
  parseInputValue,
} from '@/constants/conversions';

interface PlotRow {
  id: string;
  value: string;
  unit: LandUnit;
}

export default function ExploreScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { themeMode, setThemeMode, isDark, colors } = useAppTheme();
  const theme = colors;

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    default: {
      paddingTop: insets.top + Spacing.three,
      paddingLeft: insets.left + Spacing.four,
      paddingRight: insets.right + Spacing.four,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.four,
      paddingBottom: Spacing.four,
    },
  });

  // State: List of plot rows
  const [rows, setRows] = useState<PlotRow[]>([
    { id: '1', value: '1', unit: 'acre' },
    { id: '2', value: '50', unit: 'cent' },
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Design constants
  const accentColor = isDark ? '#34D399' : '#059669'; // Emerald Green
  const cardBorderColor = isDark ? '#2E3135' : '#E0E1E6';
  const rowBgColor = isDark ? '#1C1D20' : '#FFFFFF';

  // Calculations
  const totalSqFt = rows.reduce((acc, row) => {
    const val = parseInputValue(row.value);
    const multiplier = LAND_UNITS[row.unit].sqftValue;
    return acc + val * multiplier;
  }, 0);

  const totalAcre = totalSqFt / LAND_UNITS.acre.sqftValue;
  const totalCent = totalSqFt / LAND_UNITS.cent.sqftValue;
  const totalHectare = totalSqFt / LAND_UNITS.hectare.sqftValue;

  // Actions
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleAddRow = () => {
    const newId = Date.now().toString();
    setRows([...rows, { id: newId, value: '', unit: 'cent' }]);
    showToast('Plot division added');
  };

  const handleDeleteRow = (id: string) => {
    // Keep at least one row
    if (rows.length === 1) {
      setRows([{ id: '1', value: '', unit: 'cent' }]);
      showToast('Cleared input field');
      return;
    }
    setRows(rows.filter((row) => row.id !== id));
    showToast('Plot division removed');
  };

  const handleUpdateRowValue = (id: string, value: string) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, value } : row))
    );
  };

  const handleUpdateRowUnit = (id: string, unit: LandUnit) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, unit } : row))
    );
    showToast(`Unit set to ${LAND_UNITS[unit].label}`);
  };

  const handleClearAll = () => {
    setRows([{ id: '1', value: '', unit: 'cent' }]);
    showToast('Calculator reset');
  };

  // Export report generation
  const generateReportText = () => {
    const header = [
      'Land Area Summation Report',
      '================================',
      'List of Plots/Parcels:',
    ];

    const plotLines = rows.map((row, idx) => {
      const val = parseInputValue(row.value);
      const formattedVal = val.toLocaleString();
      const unitLabel = LAND_UNITS[row.unit].label;
      const unitSqFt = val * LAND_UNITS[row.unit].sqftValue;
      return `${idx + 1}. ${formattedVal} ${unitLabel} (${Math.round(unitSqFt).toLocaleString()} sq ft)`;
    });

    const totals = [
      '================================',
      'GRAND TOTAL AREA:',
      '--------------------------------',
      `Acre: ${formatUnitValue(totalAcre, 'acre')} ac`,
      `Cent: ${formatUnitValue(totalCent, 'cent')} ct`,
      `Hectare: ${formatUnitValue(totalHectare, 'hectare')} ha`,
      `Sq. Ft.: ${Math.round(totalSqFt).toLocaleString()} sq ft`,
      '================================',
      'Generated via MeasureIt App',
    ];

    return [...header, ...plotLines, '', ...totals].join('\n');
  };

  const handleCopyReport = async () => {
    const reportText = generateReportText();
    await Clipboard.setStringAsync(reportText);
    showToast('Copied full summation report!');
  };

  const handleShareReport = async () => {
    const reportText = generateReportText();
    try {
      await Share.share({
        message: reportText,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
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

  // Symbol definitions (using SF Symbols on iOS, Material icons on Android/Web)
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

  const deleteSymbol: any = { ios: 'trash', android: 'delete', web: 'delete' };
  const addSymbol: any = { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' };
  const copyReportSymbol: any = { ios: 'doc.on.doc.fill', android: 'content_copy', web: 'content_copy' };
  const shareReportSymbol: any = { ios: 'square.and.arrow.up', android: 'share', web: 'share' };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[styles.scrollContent, contentPlatformStyle]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
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
            Summation
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

        {/* Dynamic Running Total Summary Card */}
        <ThemedView type="backgroundElement" style={[styles.summaryCard, { borderColor: accentColor }]}>
          <View style={styles.totalsGrid}>
            <View style={styles.totalBlock}>
              <View style={styles.totalHeaderRow}>
                <SymbolView
                  name={unitSymbols.acre}
                  size={12}
                  tintColor={theme.textSecondary}
                />
                <ThemedText type="smallBold" themeColor="textSecondary">Acres</ThemedText>
              </View>
              <ThemedText style={styles.totalValue}>{formatUnitValue(totalAcre, 'acre')}</ThemedText>
            </View>
            <View style={styles.totalBlock}>
              <View style={styles.totalHeaderRow}>
                <SymbolView
                  name={unitSymbols.cent}
                  size={12}
                  tintColor={theme.textSecondary}
                />
                <ThemedText type="smallBold" themeColor="textSecondary">Cents</ThemedText>
              </View>
              <ThemedText style={styles.totalValue}>{formatUnitValue(totalCent, 'cent')}</ThemedText>
            </View>
            <View style={styles.totalBlock}>
              <View style={styles.totalHeaderRow}>
                <SymbolView
                  name={unitSymbols.hectare}
                  size={12}
                  tintColor={theme.textSecondary}
                />
                <ThemedText type="smallBold" themeColor="textSecondary">Hectares</ThemedText>
              </View>
              <ThemedText style={styles.totalValue}>{formatUnitValue(totalHectare, 'hectare')}</ThemedText>
            </View>
            <View style={styles.totalBlock}>
              <View style={styles.totalHeaderRow}>
                <SymbolView
                  name={unitSymbols.sqft}
                  size={12}
                  tintColor={theme.textSecondary}
                />
                <ThemedText type="smallBold" themeColor="textSecondary">Sq. Feet</ThemedText>
              </View>
              <ThemedText style={styles.totalValue}>{Math.round(totalSqFt).toLocaleString()}</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Plot Rows Title & Controls */}
        <View style={styles.rowsHeaderRow}>
          <ThemedText type="smallBold">Plot Divisions</ThemedText>
          <TouchableOpacity onPress={handleClearAll}>
            <ThemedText type="linkPrimary">Clear All</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Plot Rows List */}
        <View style={styles.rowsList}>
          {rows.map((row, index) => (
            <View
              key={row.id}
              style={[
                styles.rowCard,
                { borderColor: cardBorderColor, backgroundColor: rowBgColor }
              ]}
            >
              {/* Card Header Line: Index and Delete Button */}
              <View style={styles.rowHeaderLine}>
                <View style={styles.rowTitleContainer}>
                  <View style={styles.rowIndexCircle}>
                    <ThemedText type="smallBold" style={{ color: '#FFFFFF', fontSize: 11 }}>
                      {index + 1}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteRow(row.id)}
                  style={styles.deleteBtn}
                >
                  <SymbolView
                    name={deleteSymbol}
                    size={18}
                    tintColor="#EF4444"
                  />
                </TouchableOpacity>
              </View>

              {/* Card Body Line: Value and Unit */}
              <View style={styles.rowInputsContainer}>
                <TextInput
                  style={[
                    styles.rowInput,
                    {
                      color: theme.text,
                      borderColor: cardBorderColor,
                      backgroundColor: isDark ? '#2E3135' : '#F0F0F3',
                    },
                  ]}
                  keyboardType="numeric"
                  value={row.value}
                  onChangeText={(val) => handleUpdateRowValue(row.id, val)}
                  placeholder="0.0"
                  placeholderTextColor={isDark ? '#60646C' : '#9E9E9E'}
                  selectTextOnFocus
                />
                <View style={styles.segmentedRow}>
                  {UNIT_ORDER.map((u) => {
                    const isActive = row.unit === u;
                    return (
                      <TouchableOpacity
                        key={u}
                        onPress={() => handleUpdateRowUnit(row.id, u)}
                        style={[
                          styles.segmentBtn,
                          isActive && { backgroundColor: accentColor },
                          !isActive && { backgroundColor: isDark ? '#212225' : '#E0E1E6' },
                        ]}
                      >
                        <ThemedText
                          type="code"
                          style={[
                            styles.segmentText,
                            { color: isActive ? '#FFFFFF' : theme.text }
                          ]}
                        >
                          {LAND_UNITS[u].symbol.toUpperCase()}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Add Row Button */}
        <TouchableOpacity
          style={[styles.addRowBtn, { borderColor: accentColor }]}
          onPress={handleAddRow}
        >
          <View style={styles.btnContentRow}>
            <SymbolView
              name={addSymbol}
              size={16}
              tintColor={accentColor}
            />
            <ThemedText type="smallBold" style={{ color: accentColor }}>
              ADD PARCEL / ROW
            </ThemedText>
          </View>
        </TouchableOpacity>

        {/* Global Export Options */}
        <View style={styles.exportButtonsRow}>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: accentColor }]}
            onPress={handleCopyReport}
          >
            <View style={styles.btnContentRow}>
              <SymbolView
                name={copyReportSymbol}
                size={16}
                tintColor="#FFFFFF"
              />
              <ThemedText type="smallBold" style={styles.btnTextWhite}>
                COPY REPORT
              </ThemedText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnSecondary, { borderColor: accentColor }]}
            onPress={handleShareReport}
          >
            <View style={styles.btnContentRow}>
              <SymbolView
                name={shareReportSymbol}
                size={16}
                tintColor={accentColor}
              />
              <ThemedText type="smallBold" style={{ color: accentColor }}>
                SHARE REPORT
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Safety padding */}
        <View style={{ height: Spacing.six }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
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
  summaryCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 2,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  totalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  totalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  totalBlock: {
    width: '46%',
    paddingVertical: Spacing.one,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  rowsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  rowsList: {
    gap: Spacing.two,
  },
  rowCard: {
    flexDirection: 'column',
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  rowHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rowTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    width: '100%',
  },
  rowIndexCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#60646C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.two,
    fontSize: 16,
    fontWeight: '600',
  },
  segmentedRow: {
    flexDirection: 'row',
    borderRadius: Spacing.one,
    overflow: 'hidden',
    flex: 1.8,
    height: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: Spacing.one,
  },
  addRowBtn: {
    height: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  exportButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.three,
    marginVertical: Spacing.two,
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  btnSecondary: {
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
