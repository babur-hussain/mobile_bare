import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import {
    initConnection,
    endConnection,
    getSubscriptions,
    requestSubscription,
    purchaseErrorListener,
    purchaseUpdatedListener,
    finishTransaction,
    type Subscription,
    type Purchase,
    type PurchaseError,
} from 'react-native-iap';
import subscriptionService from '../services/subscription.service';

export const SUBSCRIPTION_SKUS = Platform.select({
    android: ['premium_monthly', 'premium_yearly'],
    default: [],
});

export interface UseIAPState {
    products: Subscription[];
    loading: boolean;
    purchasing: boolean;
    error: string | null;
    currentPlan: string;
    purchaseSubscription: (productId: string, offerToken?: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useIAP(): UseIAPState {
    const [products, setProducts] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState('free');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await initConnection();
            const [subs, status] = await Promise.all([
                getSubscriptions({ skus: SUBSCRIPTION_SKUS }),
                subscriptionService.getStatus(),
            ]);
            setProducts(subs);
            setCurrentPlan(status.plan);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();

        const purchaseUpdateSub = purchaseUpdatedListener(
            async (purchase: Purchase) => {
                const token = purchase.purchaseToken;
                const productId = purchase.productId;
                if (!token) return;

                try {
                    const result = await subscriptionService.verifyReceipt({
                        productId,
                        purchaseToken: token,
                    });
                    await finishTransaction({ purchase, isConsumable: false });
                    setCurrentPlan(result.plan);
                    Alert.alert('Subscription Activated', `You are now on the ${result.plan} plan!`);
                } catch {
                    Alert.alert('Verification Failed', 'Purchase was made but could not be verified. Please contact support.');
                }
            },
        );

        const purchaseErrorSub = purchaseErrorListener((err: PurchaseError) => {
            if ((err.code as string) !== 'E_USER_CANCELLED') {
                Alert.alert('Purchase Error', err.message ?? 'Something went wrong');
            }
        });

        return () => {
            purchaseUpdateSub.remove();
            purchaseErrorSub.remove();
            endConnection();
        };
    }, [loadData]);

    const purchaseSubscription = useCallback(
        async (productId: string, offerToken?: string) => {
            setPurchasing(true);
            try {
                if (Platform.OS === 'android') {
                    let actualOfferToken = offerToken;
                    if (!actualOfferToken) {
                        const prod = products.find(p => p.productId === productId);
                        actualOfferToken = (prod as any)?.subscriptionOfferDetails?.[0]?.offerToken;
                    }
                    if (!actualOfferToken) {
                        throw new Error('No offer token found for Android subscription');
                    }
                    await requestSubscription({
                        subscriptionOffers: [{ sku: productId, offerToken: actualOfferToken }]
                    });
                } else {
                    await requestSubscription({
                        sku: productId
                    });
                }
                // Outcome handled by purchaseUpdatedListener above
            } catch (e: any) {
                if (e?.code !== 'E_USER_CANCELLED') {
                    Alert.alert('Error', e?.message ?? 'Purchase failed');
                }
            } finally {
                setPurchasing(false);
            }
        },
        [products],
    );

    return {
        products,
        loading,
        purchasing,
        error,
        currentPlan,
        purchaseSubscription,
        refresh: loadData,
    };
}
