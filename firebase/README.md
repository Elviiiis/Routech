# Firebase Routech

Arquivos prontos para colar/publicar no Firebase:

- `firebase/firestore.rules`
- `firebase/storage.rules`

Banco principal:

- Em produção, use `ROUTECH_DATA_PROVIDER=firestore`
- Em desenvolvimento local, você pode manter `ROUTECH_DATA_PROVIDER=file`

Credenciais administrativas esperadas no servidor:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

Alternativa:

- `FIREBASE_SERVICE_ACCOUNT_JSON`

Colecoes pensadas para o painel:

- `machines`
- `settings/showcase`
- `quotes`

As regras de escrita administrativa usam a custom claim `admin: true`.

Exemplo do que o usuario autenticado precisa ter no token:

```json
{
  "admin": true
}
```

Observacoes:

- A leitura publica das maquinas depende de `published == true`.
- A leitura publica da vitrine usa o documento `settings/showcase`.
- Os orcamentos podem ser criados publicamente com validacao de campos, mas leitura e atualizacao ficam restritas ao admin.
- Em `storage.rules`, a pasta publica de imagens do catalogo fica em `machine-assets/`.
- O projeto possui um seed utilitario para migrar o JSON local para o Firestore:
  `pnpm seed:firestore`
