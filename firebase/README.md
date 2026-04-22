# Firebase Routech

Arquivos prontos para colar/publicar no Firebase:

- `firebase/firestore.rules`
- `firebase/storage.rules`

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
