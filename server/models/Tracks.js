import { property, graphQl, query, hasMany } from '@graphite/decorators';
import { get } from 'lodash';
import spotify from '../api/spotify';
import artists from './Artists';
import { loaderTracks } from '../loaders';

@graphQl
class Track {
  @property('String')
  name;

  /* eslint-disable camelcase */
  @property('String')
  disc_number;

  @property('String')
  duration_ms;

  @property('String')
  track_number

  @property('String')
  preview_url
  /* eslint-enable camelcase */

  @hasMany
  async artist(track) {
    try {
      return get(track, 'artists', []).map(async ({ id }) => {
        const newArtist = await spotify.getArtist(id);
        return artists.mapArtist(newArtist);
      });
    } catch (error) {
      return error;
    }
  }

  @query('name: String!')
  async track(_, { name }) {
    try {
      const data = await loaderTracks.load(name);
      const items = get(data, 'tracks.items', []);
      return items.map(track => this.mapTrack(track));
    } catch (error) {
      return error;
    }
  }

  @query({
    fields: 'id: String!',
    responseType: 'Track',
  })
  async tracksByAlbumId(_, { id }) {
    try {
      const data = await spotify.getTracksByAlbum(id);
      const items = get(data, 'body.items', []);
      return items.map(track => this.mapTrack(track));
    } catch (error) {
      return error;
    }
  }

  mapTrack(track) {
    const { id } = track;
    return Object.assign(track, { _id: id });
  }
}

export default new Track();
