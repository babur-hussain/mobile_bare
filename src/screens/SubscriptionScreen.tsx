import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useIAP } from '../hooks/useIAP';
import { Colors, APP_COLORS } from '../constants/colors';

export default function SubscriptionScreen() {
    const insets = useSafeAreaInsets();
    const { products, loading, purchasing, error, currentPlan, purchaseSubscription } = useIAP();

    const handlePurchase = (productId: string) => {
        purchaseSubscription(productId);
    };

    const renderProduct = ({ item }: { item: any }) => {
        // Determine title and price from item depending on the platform's nested objects
        const title = Platform.OS === 'android' ? item.name : item.title;
        const description = item.description;
        // Note: react-native-iap exposes pricing in nested objects depending on OS.
        // For this simple UI, we fetch the formatted price of the first offer/subscription period if available.
        let priceString = item.localizedPrice;
        if (Platform.OS === 'android' && item.subscriptionOfferDetails?.length > 0) {
            priceString = item.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0].formattedPrice;
        }

        const isCurrentPlan =
            (currentPlan === 'pro' && item.id.includes('monthly')) || // Basic heuristic
            (currentPlan === 'enterprise' && item.id.includes('yearly'));

        return (
            <View style={[styles.card, isCurrentPlan && styles.cardActive]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    {isCurrentPlan && (
                        <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Current Plan</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.cardDescription}>{description}</Text>
                <Text style={styles.cardPrice}>{priceString}</Text>

                <TouchableOpacity
                    style={[
                        styles.subscribeButton,
                        isCurrentPlan && styles.subscribeButtonDisabled
                    ]}
                    disabled={purchasing || isCurrentPlan}
                    onPress={() => handlePurchase(item.id)}
                >
                    {purchasing ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.subscribeButtonText}>
                            {isCurrentPlan ? 'Active' : 'Subscribe'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <Sparkles size={32} color={APP_COLORS.primary} />
                <Text style={styles.title}>Upgrade to Premium</Text>
                <Text style={styles.subtitle}>Unlock unlimited posting and analytics.</Text>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <AlertCircle size={24} color={Colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={APP_COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No subscription plans available right now.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: APP_COLORS.surface,
    },
    header: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 12,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cardActive: {
        borderColor: APP_COLORS.primary,
        backgroundColor: `${APP_COLORS.primary}05`,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    currentBadge: {
        backgroundColor: APP_COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    currentBadgeText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    cardDescription: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    cardPrice: {
        fontSize: 28,
        fontWeight: '800',
        color: APP_COLORS.primary,
        marginBottom: 20,
    },
    subscribeButton: {
        backgroundColor: APP_COLORS.primary,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    subscribeButtonDisabled: {
        backgroundColor: Colors.border,
    },
    subscribeButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        gap: 8,
    },
    errorText: {
        color: Colors.error,
        flex: 1,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.textMuted,
        marginTop: 40,
    },
});
