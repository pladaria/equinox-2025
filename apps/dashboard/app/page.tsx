'use client';
import styles from './page.module.css';
import * as React from 'react';

export default function Home() {
    const [namespaces, setNamespaces] = React.useState<Array<string>>([]);
    const [namespace, setNamespace] = React.useState<string>('');
    const [paths, setPaths] = React.useState<Array<string>>([]);
    const [enabledPaths, setEnabledPaths] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        fetch('http://localhost:3001/api/namespaces')
            .then((res) => res.json())
            .then((data) => setNamespaces(data));
    }, []);

    React.useEffect(() => {
        if (namespace) {
            fetch(`http://localhost:3001/api/paths/${encodeURIComponent(namespace)}/enabled`)
                .then((res) => res.json())
                .then((data) => {
                    console.log('enabledPaths', new Set(data));
                    setEnabledPaths(new Set(data));
                });
        }
    }, [namespace]);

    return (
        <>
            <div style={{color: 'white', background: '#444', padding: 16, fontSize: 20}}>
                Translations dashboard
            </div>
            <div style={{padding: 32, maxWidth: 800, margin: '0 auto'}}>
                {namespaces.map((ns) => {
                    const isOpened = ns === namespace;
                    return (
                        <div
                            onClick={
                                isOpened
                                    ? undefined
                                    : () => {
                                          setNamespace(ns);
                                          setPaths([]);
                                          fetch(`http://localhost:3001/api/paths/${encodeURIComponent(ns)}`)
                                              .then((res) => res.json())
                                              .then((data) => {
                                                  setPaths(data);
                                              });
                                      }
                            }
                            key={ns}
                            className={styles.card}
                            style={{
                                cursor: isOpened ? 'default' : 'pointer',
                                margin: '16px',
                                padding: '16px',
                                border: '1px solid #ccc',
                                borderRadius: 8,
                            }}
                        >
                            {ns}
                            {isOpened && (
                                <div style={{marginTop: 16, paddingLeft: 16}} key={enabledPaths.size}>
                                    {paths.map((path) => {
                                        const id = 'path:' + path;
                                        const nsEncoded = encodeURIComponent(ns);
                                        const pathEncoded = encodeURIComponent(path);
                                        console.log({enabledPaths, path, has: enabledPaths.has(path)});
                                        return (
                                            <div
                                                key={path}
                                                style={{
                                                    padding: '8px 0',
                                                    borderBottom: '1px solid #eee',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={id}
                                                    defaultChecked={enabledPaths.has(path)}
                                                    onChange={(event) => {
                                                        if (event.target.checked) {
                                                            fetch(
                                                                `http://localhost:3001/api/paths/${nsEncoded}/add?path=${pathEncoded}`
                                                            );
                                                        } else {
                                                            fetch(
                                                                `http://localhost:3001/api/paths/${nsEncoded}/remove?path=${pathEncoded}`
                                                            );
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={id}>{path}</label>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
