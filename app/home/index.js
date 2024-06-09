import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, FontAwesome6, Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Categories from '../../components/categories';
import { apiCall } from '../../api';
import ImageGrid from '../../components/ImageGrid';
import { debounce } from 'lodash'
import FilterModal from '../../components/filterModal';

var page = 1;
const HomeScreen = () => {
    const { top } = useSafeAreaInsets();
    const paddingTop = top > 0 ? top + 30 : 30;
    const [search, setSearch] = useState('')
    const searchInputRef = useRef(null);
    const [activeCategory, setActiveCategory] = useState(null)
    const [images, setImages] = useState([])
    const modalRef = useRef(null);
    const [filters, setFilters] = useState(null);
    const scrollRef = useRef(null)
    const [isEndReached, setIsEndReached] = useState(false);


    const fetchImage = async (params = { page: 1 }, append = true) => {
        let res = await apiCall(params);
        if (res.success && res?.data?.hits) {
            if (append) {
                setImages([...images, ...res.data.hits])
            }
            else {
                setImages([...res.data.hits])
            }

        }
        // console.log(res.data?.hits[0]);
    }

    const openFilterModal = () => {
        modalRef.current.present();
    }

    const closeFilterModal = () => {
        modalRef.current.close();
    }

    const applyFilter = () => {
        if (filters) {
            page = 1;
            setImages([])
            let params = {
                page, ...filters
            }
            if (activeCategory) params.categories = activeCategory;
            if (search) params.q = search;
            fetchImage(params, false);
        }
        closeFilterModal();
    }

    const resetFilter = () => {
        if (filters) {
            page = 1;
            setFilters(null)
            setImages([])
            let params = {
                page,
            }
            if (activeCategory) params.categories = activeCategory;
            if (search) params.q = search;
            fetchImage(params, false);
        }
        closeFilterModal();
    }

    const clearSearch = () => {
        setSearch('');
        searchInputRef.current.clear();
    }

    useEffect(() => {
        fetchImage();
    }, [])

    const handleChangeCategory = (cat) => {
        setActiveCategory(cat)
        clearSearch()
        setImages([])
        page = 1;
        let params = {
            page,
            ...filters
        }
        if (cat) params.category = cat;
        fetchImage(params, false);
    }

    const handleSearch = (text) => {
        setSearch(text);
        if (text.length > 2) {
            page = 1;
            setImages([])
            fetchImage({ page, q: text })
        }
        if (text === '') {
            page = 1;
            searchInputRef?.current?.clear()
            setImages([])
            fetchImage({ page })
        }

    }


    const handleTextDebounce = useCallback(debounce(handleSearch, 400), [])

    // console.log(activeCategory)

    const clearThisFilter = (filterName) => {
        let filterz = { ...filters };
        delete filterz[filterName];
        setFilters({ ...filterz });
        page = 1;
        setImages([])
        let params = {
            page, ...filterz
        }
        if (activeCategory) params.categories = activeCategory;
        if (search) params.q = search;
        fetchImage(params, false);
    }

    const handleScroll = (e) => {
        // console.log('scroll event fired')
        const contentHeight = e.nativeEvent.contentSize.height;
        const scrollViewHeight = e.nativeEvent.layoutMeasurement.height;
        const scrollOffset = e.nativeEvent.contentOffset.y;
        const bottomPosition = contentHeight - scrollViewHeight;
        if (scrollOffset >= bottomPosition - 1) {
            if (!isEndReached) {
                setIsEndReached(true);
                //fetch more images
                ++page;
                let params = {
                    page,
                    ...filters
                }
                if (activeCategory) params.category = activeCategory;
                if (search) params.q = search;
                fetchImage(params)
            }
        }
        else if (isEndReached) {
            setIsEndReached(false);
        }
    }

    const handleScrollUp = () => {
        scrollRef.current.scrollTo({
            y: 0,
            animated: true
        })
    }

    return (
        <View style={[styles.container, { paddingTop }]}>
            <View style={styles.header}>
                <Pressable onPress={handleScrollUp}>
                    <Text style={styles.title}>
                        Pixels
                    </Text>
                </Pressable>
                <Pressable onPress={openFilterModal}>
                    <FontAwesome6 name='bars-staggered' size={22} color={theme.colors.neutral(0.7)} />
                </Pressable>
            </View>


            <ScrollView
                ref={scrollRef}
                onScroll={handleScroll}
                scrollEventThrottle={5}
                contentContainerStyle={{ gap: 15 }}>
                <View style={styles.searchBar}>
                    <View style={styles.searchIcon}>
                        <Feather name='search' size={24} color={theme.colors.neutral(0.4)} />
                    </View>
                    <TextInput
                        ref={searchInputRef}
                        // value={search}
                        onChangeText={handleTextDebounce}
                        placeholder='Search for photos...'
                        style={styles.searchInput}
                    />
                    {
                        search && (
                            <Pressable onPress={() => handleSearch('')} style={styles.closeIcon}>
                                <Ionicons name='close' size={24} color={theme.colors.neutral(0.6)} />
                            </Pressable>
                        )
                    }

                </View>
                <View>
                    <Categories
                        handleChangeCategory={handleChangeCategory}
                        activeCategory={activeCategory} />
                </View>
                {
                    filters && (
                        <View>
                            <ScrollView
                                contentContainerStyle={styles.filters}
                                horizontal showsHorizontalScrollIndicator={false}>
                                {
                                    Object.keys(filters).map((key, index) => {
                                        return (
                                            <View key={key} style={styles.filterItem}>
                                                {
                                                    key === 'colors' ? (
                                                        <View style={{
                                                            height: 20,
                                                            width: 30,
                                                            borderRadius: 7,
                                                            backgroundColor: filters[key]
                                                        }}>
                                                        </View>
                                                    ) :
                                                        (
                                                            <Text style={styles.filterItemText}>{filters[key]}</Text>
                                                        )
                                                }

                                                <Pressable style={styles.filterCloseIcon} onPress={() => clearThisFilter(key)}>
                                                    <Ionicons name='close' size={14} color={theme.colors.neutral(0.9)} />
                                                </Pressable>
                                            </View>
                                        )
                                    })
                                }
                            </ScrollView>
                        </View>
                    )
                }
                <View>
                    {
                        images.length > 0 && <ImageGrid images={images} />
                    }
                </View>

                <View style={{ marginBottom: 70, marginTop: images.length > 0 ? 10 : 70 }}>
                    <ActivityIndicator size={'large'} />
                </View>
            </ScrollView>

            {/* filter here */}

            <FilterModal
                filters={filters}
                setFilters={setFilters}
                onClose={closeFilterModal}
                onApply={applyFilter}
                onReset={resetFilter}
                modalRef={modalRef} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 15
    }
    , header: {
        alignItems: 'center',
        marginHorizontal: wp(4),
        justifyContent: 'space-between',
        flexDirection: 'row'

    }
    , title: {
        fontSize: hp(4),
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.neutral(0.9)
    },
    searchBar: {
        marginHorizontal: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.grayBG,
        backgroundColor: theme.colors.white,
        padding: 6,
        marginLeft: 10
    },
    searchIcon: {
        padding: 8
    },
    searchInput: {
        flex: 1,
        borderRadius: theme.radius.sm,
        paddingVertical: 10,
        fontSize: hp(1.8)
    },
    closeIcon: {
        backgroundColor: theme.colors.neutral(0.1),
        padding: 8,
        borderRadius: theme.radius.sm
    },
    filters: {
        paddingHorizontal: wp(4),
        gap: 10
    },
    filterItem: {
        backgroundColor: theme.colors.grayBG,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.radius.xs,
        gap: 10,
        paddingHorizontal: 10
    },
    filterItemText: {
        fontSize: hp(1.9)
    }
    ,
    filterCloseIcon: {
        backgroundColor: theme.colors.neutral(0.2),
        padding: 4,
        borderRadius: 7
    }

})

export default HomeScreen