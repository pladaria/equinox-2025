'use client';
import * as React from 'react';
import styles from './page.module.css';

const Card = ({children}: {children: React.ReactNode}) => {
    return (
        <div
            style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                border: '1px solid #DDD',
                borderRadius: 20,
                padding: '48px 24px 24px 24px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {children}
        </div>
    );
};

export default function Home() {
    const [products, setProducts] = React.useState<null | Array<any>>(null);
    const [locale, setLocale] = React.useState<string>(
        () => globalThis.localStorage?.getItem('locale') || 'es-ES'
    );

    React.useEffect(() => {
        if (!locale) {
            setLocale('es-ES');
            return;
        }
        fetch(`http://localhost:3001/products/${locale}`)
            .then((res) => res.json())
            .then((data) => setProducts(data.products));
    }, [locale]);

    const changeLocale = (locale: string) => {
        globalThis.localStorage?.setItem('locale', locale);
        setLocale(locale);
    };

    if (!products) {
        return;
    }

    return (
        <div style={{padding: 64}}>
            <div style={{display: 'flex', flexDirection: 'row', paddingBottom: 64, gap: 16}}>
                <button
                    className={styles.secondary}
                    style={{background: locale === 'es-ES' ? '#ddd' : 'white'}}
                    onClick={() => changeLocale('es-ES')}
                >
                    Castellano
                </button>
                <button
                    className={styles.secondary}
                    style={{background: locale === 'ca-ES' ? '#ddd' : 'white'}}
                    onClick={() => changeLocale('ca-ES')}
                >
                    Català
                </button>
                <button
                    className={styles.secondary}
                    style={{background: locale === 'eu-ES' ? '#ddd' : 'white'}}
                    onClick={() => changeLocale('eu-ES')}
                >
                    Euskara
                </button>
                <button
                    className={styles.secondary}
                    style={{background: locale === 'en-UK' ? '#ddd' : 'white'}}
                    onClick={() => changeLocale('en-UK')}
                >
                    English
                </button>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 16,
                    maxWidth: 1400,
                    margin: '0 auto',
                    color: '#121212',
                }}
            >
                {products?.map((product) => {
                    return (
                        <Card key={product.name}>
                            <h2 style={{fontSize: 20, paddingBottom: 16}}>{product.name}</h2>
                            <p>{product.description}</p>
                            <ul style={{marginLeft: 16, color: '#777', paddingBottom: 24}}>
                                {product.features.map((feature: string, index: number) => (
                                    <li
                                        key={index}
                                        style={{fontSize: 16, fontWeight: index === 0 ? 'bold' : 'normal'}}
                                    >
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div style={{flexGrow: 1}} />
                            {product.price.discount && (
                                <p
                                    style={{
                                        background: '#b00',
                                        color: 'white',
                                        display: 'inline-flex',
                                        alignSelf: 'flex-start',
                                        padding: '2px 4px 1px 4px',
                                        fontSize: 14,
                                        marginBottom: 8,
                                    }}
                                >
                                    -{product.price.discount}
                                </p>
                            )}
                            <p style={{marginBottom: 4, fontWeight: '500'}}>
                                {product.price.original && (
                                    <span style={{color: '#777'}}>
                                        <span
                                            style={{
                                                fontSize: 24,
                                                textDecoration: 'line-through',

                                                marginRight: 2,
                                            }}
                                        >
                                            {product.price.original}
                                        </span>
                                        <span style={{fontSize: 16, marginRight: 8}}>
                                            {product.price.currency}
                                        </span>
                                    </span>
                                )}
                                <span style={{color: product.price.original ? '#b00' : '#121212'}}>
                                    <span
                                        style={{
                                            fontSize: 24,
                                            marginRight: 2,
                                        }}
                                    >
                                        {product.price.discounted}
                                    </span>
                                    <span style={{fontSize: 16}}>
                                        {product.price.currency}/{product.price.period}
                                    </span>
                                </span>
                            </p>
                            <p
                                style={{
                                    paddingBottom: 16,
                                    fontSize: 14,
                                    color: product.price.limited ? '#b00' : '#777',
                                }}
                            >
                                {product.price.duration}
                            </p>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <button
                                    style={{
                                        background: '#066fcb',
                                        color: 'white',
                                        padding: '4px 16px',
                                        border: 'none',
                                        fontSize: 16,
                                        borderRadius: 4,
                                    }}
                                >
                                    {product.cta}
                                </button>
                                <a
                                    href="#"
                                    style={{
                                        fontSize: 14,
                                        color: '#066fcb',
                                        textDecoration: 'none',
                                    }}
                                >
                                    {product.link}
                                </a>
                            </div>
                            {product.tag && (
                                <div
                                    style={{
                                        fontSize: 13,
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        color: 'white',
                                        background: '#0b2739',
                                        padding: '2px 16px 2px 16px',
                                        borderBottomRightRadius: 20,
                                    }}
                                >
                                    {product.tag}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
