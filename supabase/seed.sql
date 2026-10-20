-- Demo data copied from shared/mock.ts so the app isn't empty while neighbors join.
-- Demo neighbors have no login (user_id is null), the last name "Démo" and the
-- civility "Famille". Remove them all with:
--   delete from public.profiles where user_id is null and last_name = 'Démo';

with demo (first_name, location, admitted_on) as (
  values
    ('Anna',   'A-3a', date '2025-03-15'),
    ('Marc',   'A-1c', date '2025-04-02'),
    ('Sofia',  'B-4b', date '2025-05-20'),
    ('Tom',    'B-0a', date '2025-06-11'),
    ('Priya',  'A-2d', date '2025-07-08'),
    ('Leo',    'C-5b', date '2025-09-01'),
    ('Hannah', 'C-2a', date '2025-11-17'),
    ('Omar',   'B-1c', date '2026-01-09'),
    ('Inès',   'A-0b', date '2026-03-23')
),
neighbors as (
  insert into public.profiles (civility, first_name, last_name, location, admitted_on)
  select 'Famille', first_name, 'Démo', location, admitted_on from demo
  returning id, first_name
)
insert into public.items (owner_id, title, category, kind, status, description, condition, photos)
select n.id, i.title, i.category, i.kind, i.status, i.description, 'Bon état',
       jsonb_build_array(
         jsonb_build_object('label', 'Vue de face', 'hue', i.hue),
         jsonb_build_object('label', 'Gros plan', 'hue', i.hue + 18),
         jsonb_build_object('label', 'Accessoires', 'hue', i.hue - 12)
       )
from (
  values
    ('Anna', 'Nettoyeur haute pression', 'Cleaning', 'loan', 'available',
     'Idéal pour les allées, le mobilier de jardin et les abris vélo. Fourni avec un tuyau de 5 m, une buse turbo et une lance à mousse. Merci de le rendre rincé et sec. Révisé au printemps.', 196),
    ('Marc', 'Perceuse sans fil avec coffret d’embouts', 'Tools', 'loan', 'available',
     'Perceuse-visseuse 18 V avec une batterie de rechange et un coffret de 60 embouts pour le bois, le métal et la maçonnerie. Chargeur fourni.', 28),
    ('Sofia', 'Escabeau trois marches', 'Tools', 'loan', 'unavailable',
     'Escabeau en aluminium, charge maximale 150 kg. Actuellement prêté à un voisin pour le week-end. Patins antidérapants.', 150),
    ('Tom', 'Aérateur de pelouse manuel', 'Garden', 'loan', 'available',
     'Aérateur à pointes pour les pelouses tassées. À utiliser une ou deux fois par an, après la pluie. Poignées resserrées.', 100),
    ('Priya', 'Robot pâtissier', 'Kitchen', 'loan', 'available',
     'Robot pâtissier de cinq litres avec crochet pétrisseur, fouet et batteur plat. Parfait pour le pain et les grandes quantités de pâte à gâteau. Bol et tous les accessoires inclus.', 330),
    ('Leo', 'Aspirateur eau et poussière', 'Cleaning', 'loan', 'available',
     'Aspirateur d’atelier de vingt litres pour le garage, les liquides renversés et les feuilles. Suceur plat inclus. Filtre changé récemment.', 210),
    ('Hannah', 'Taille-haie électrique', 'Garden', 'loan', 'unavailable',
     'Taille-haie léger de 600 mm avec interrupteur de sécurité. Prêté jusqu’à la fin du mois. Lame fraîchement aiguisée.', 80),
    ('Omar', 'Tables pliantes sur tréteaux (x2)', 'Outdoor', 'loan', 'available',
     'Deux tables pliantes de 1,80 m pour les fêtes de quartier, les pique-niques et les trocs de graines. Les pieds se verrouillent bien.', 15),
    ('Inès', 'Cartons de déménagement (x10)', 'Outdoor', 'gift', 'available',
     'Dix cartons solides, déjà pliés, après notre emménagement. À récupérer quand vous voulez.', 40),
    ('Leo', 'Pompe à vélo', 'Outdoor', 'loan', 'removed',
     'Retiré par son propriétaire.', 240)
) as i (first_name, title, category, kind, status, description, hue)
join neighbors n on n.first_name = i.first_name;
