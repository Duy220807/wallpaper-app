import { View, Text, StyleSheet, Pressable } from 'react-native'
import React, { useCallback, useMemo } from 'react'
import { BlurView } from 'expo-blur'
import {
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import Animated, { Extrapolation, FadeInDown, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { hp } from '../helpers/common';
import { theme } from '../constants/theme';
import { ColorFilter, CommonFilterRow, SectionView } from './filterView';
import { capitalize } from 'lodash';
import { data } from '../constants/data';

const FilterModal = ({ modalRef, onClose, onApply, onReset, filters, setFilters }) => {
    const snapPoints = useMemo(() => ['75%'], []);
    const handleSheetChanges = useCallback((index) => {
        console.log('handleSheetChanges', index);
    }, []);

    const sections = {
        'order': (props) => (<CommonFilterRow {...props} />),
        'orientation': (props) => (<CommonFilterRow {...props} />),
        'type': (props) => (<CommonFilterRow {...props} />),
        'colors': (props) => (<ColorFilter {...props} />),
    }



    const CustomBackdrop = ({ animatedIndex, style }) => {
        const containerAnimatedStyle = useAnimatedStyle(() => {
            let opacity = interpolate(
                animatedIndex.value,
                [-1, 0],
                [0, 1],
                Extrapolation.CLAMP
            )
            return {
                opacity
            }
        })
        const containerStyle = [
            StyleSheet.absoluteFill,
            style,
            style.overlay,
            containerAnimatedStyle
        ]
        return (
            <Animated.View style={containerStyle}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    tint='dark'
                    intensity={25}
                />
            </Animated.View>
        )
    }
    return (
        <BottomSheetModal
            enablePanDownToClose={true}
            ref={modalRef}
            index={0}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            backdropComponent={CustomBackdrop}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.content}>
                    <Text style={styles.filterText}>Filters</Text>

                    {
                        Object.keys(sections).map((sessionName, index) => {
                            let sectionView = sections[sessionName];
                            let sectionData = data.filters[sessionName];
                            let title = capitalize(sessionName);
                            return (
                                <Animated.View
                                    entering={FadeInDown.delay((index * 100) + 100).springify().damping(11)}
                                    key={sessionName}>
                                    <SectionView
                                        title={title}
                                        content={sectionView({ data: sectionData, filters, setFilters, filterName: sessionName })}
                                    />
                                </Animated.View>
                            )
                        })
                    }
                    <Animated.View
                        entering={FadeInDown.delay(500).springify().damping(11)}
                        style={styles.buttons}>
                        <Pressable style={styles.resetButton} onPress={onReset}>
                            <Text style={[styles.buttonText, { color: theme.colors.neutral(0.9) }]}>Reset</Text>
                        </Pressable>
                        <Pressable style={styles.applyButton} onPress={onApply}>
                            <Text style={[styles.buttonText, { color: 'white' }]}>Apply</Text>
                        </Pressable>
                    </Animated.View>

                </View>
            </BottomSheetView>
        </BottomSheetModal>
    )
}

const styles = StyleSheet.create({

    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0)'
    },
    content: {
        flex: 1,
        gap: 15,
        // width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    filterText: {

        fontSize: hp(4),
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.neutral(0.8),
        marginBottom: 5,
    },
    buttons: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    applyButton: {
        flex: 1,
        backgroundColor: theme.colors.neutral(0.8),
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.md,
        borderCurve: 'continuous'
    },
    resetButton: {
        flex: 1,
        backgroundColor: theme.colors.neutral(0.03),
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.md,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: theme.colors.grayBG
    },
    buttonText: {
        fontSize: hp(2.2)
    }
});


export default FilterModal