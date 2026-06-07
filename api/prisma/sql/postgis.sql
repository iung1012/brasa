-- Rode UMA vez após `prisma migrate dev`:
--   docker exec -i brasa_db psql -U brasa -d brasa < prisma/sql/postgis.sql
-- (cria índices geográficos e triggers que mantêm `geom` sincronizado com lat/lng)

-- índice GIST para buscas por proximidade (ST_DWithin)
CREATE INDEX IF NOT EXISTS user_location_geom_idx ON "UserLocation" USING GIST (geom);
CREATE INDEX IF NOT EXISTS venue_geom_idx          ON "Venue"        USING GIST (geom);

-- preenche geom a partir de lat/lng automaticamente
CREATE OR REPLACE FUNCTION sync_geom() RETURNS trigger AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_location_geom_sync ON "UserLocation";
CREATE TRIGGER user_location_geom_sync
  BEFORE INSERT OR UPDATE ON "UserLocation"
  FOR EACH ROW EXECUTE FUNCTION sync_geom();

DROP TRIGGER IF EXISTS venue_geom_sync ON "Venue";
CREATE TRIGGER venue_geom_sync
  BEFORE INSERT OR UPDATE ON "Venue"
  FOR EACH ROW EXECUTE FUNCTION sync_geom();
